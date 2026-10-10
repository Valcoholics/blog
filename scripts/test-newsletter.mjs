// Run with Node 22+: node --experimental-strip-types --test scripts/test-newsletter.mjs
// Every fetch is mocked; this harness never submits an address or sends email.
import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import handler from '../pages/api/subscribe.ts';
import { subscribeCall } from '../core/components/NewsletterForm/utils.ts';

const configNames = [
  'MAILCHIMP_API_KEY',
  'MAILCHIMP_AUDIENCE_ID',
  'MAILCHIMP_SERVER_PREFIX',
];
const originalConfig = Object.fromEntries(
  configNames.map((name) => [name, process.env[name]])
);
const originalFetch = globalThis.fetch;

beforeEach(() => {
  process.env.MAILCHIMP_API_KEY = 'test-key';
  process.env.MAILCHIMP_AUDIENCE_ID = 'test-audience';
  process.env.MAILCHIMP_SERVER_PREFIX = 'us99';
  globalThis.fetch = async () => {
    assert.fail('An unexpected request was attempted');
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const name of configNames) {
    if (originalConfig[name] === undefined) delete process.env[name];
    else process.env[name] = originalConfig[name];
  }
});

async function request(body, method = 'POST') {
  let status;
  let result;
  const response = {
    status(value) {
      status = value;
      return this;
    },
    json(value) {
      result = value;
      return this;
    },
  };
  await handler({ method, body }, response);
  return { status, result };
}

function mockResponse(status, value) {
  globalThis.fetch = async () => new Response(JSON.stringify(value), { status });
}

test('API rejects unsupported methods without contacting Mailchimp', async () => {
  assert.equal((await request(null, 'GET')).status, 405);
});

test('API rejects missing, malformed, and invalid addresses without crashing', async () => {
  for (const body of [
    undefined, null, '', [], {}, { email: null }, { email: 123 },
    { email: [] }, { email: {} }, { email: '   ' },
    { email: 'not-an-address' }, { email: 'a b@example.com' },
    { email: 'a@@example.com' },
  ]) {
    const response = await request(body);
    assert.equal(response.status, 400);
    assert.equal(typeof response.result.error, 'string');
    assert.notEqual(response.result.success, true);
  }
});

test('API detects every missing Mailchimp setting before a request', async () => {
  for (const name of configNames) {
    const value = process.env[name];
    delete process.env[name];
    const response = await request({ email: 'reader@example.com' });
    assert.equal(response.status, 500);
    assert.match(response.result.error, /configuration is missing/);
    process.env[name] = value;
  }
});

test('API trims the address and requests pending confirmation, then acknowledges it', async () => {
  let submitted;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://us99.api.mailchimp.com/3.0/lists/test-audience/members');
    assert.equal(options.method, 'POST');
    submitted = JSON.parse(options.body);
    return new Response(JSON.stringify({ id: 'member', status: 'pending' }), { status: 200 });
  };
  const response = await request({ email: '  Reader@example.com  ' });
  assert.deepEqual(submitted, { email_address: 'Reader@example.com', status: 'pending' });
  assert.deepEqual(response, { status: 201, result: { success: true } });
});

test('API preserves the existing duplicate-member response', async () => {
  mockResponse(400, { title: 'Member Exists' });
  const response = await request({ email: 'reader@example.com' });
  assert.equal(response.status, 400);
  assert.match(response.result.error, /already subscribed/);
});

test('API propagates a provider failure as an error, never success', async () => {
  mockResponse(400, { detail: 'The address was rejected' });
  assert.deepEqual(await request({ email: 'reader@example.com' }), {
    status: 400,
    result: { error: 'The address was rejected' },
  });
});

test('API rejects an unexpected success payload instead of claiming confirmation', async () => {
  for (const payload of [{}, null, { status: 'subscribed' }]) {
    mockResponse(200, payload);
    const response = await request({ email: 'reader@example.com' });
    assert.equal(response.status, 502);
    assert.notEqual(response.result.success, true);
  }
});

test('API handles provider connection failures and malformed JSON', async () => {
  globalThis.fetch = async () => { throw new Error('Connection failed'); };
  assert.equal((await request({ email: 'reader@example.com' })).status, 500);
  globalThis.fetch = async () => new Response('<html>Upstream error</html>', { status: 502 });
  assert.equal((await request({ email: 'reader@example.com' })).status, 500);
});

test('client sends to the canonical API path and accepts explicit success', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/subscribe/');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { email: 'reader@example.com' });
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  };
  await assert.doesNotReject(subscribeCall({ email: 'reader@example.com' }));
});

test('client rejects non-2xx responses even when the body claims success', async () => {
  mockResponse(500, { success: true });
  await assert.rejects(subscribeCall({ email: 'reader@example.com' }));
  mockResponse(400, { error: 'You are already subscribed' });
  await assert.rejects(subscribeCall({ email: 'reader@example.com' }), /already subscribed/);
});

test('client rejects absent, false, and conflicting success fields', async () => {
  for (const payload of [null, {}, { success: false }, { success: 'true' }, { success: true, error: 'Failure' }]) {
    mockResponse(200, payload);
    await assert.rejects(subscribeCall({ email: 'reader@example.com' }));
  }
});

test('client rejects invalid JSON and connection failures', async () => {
  globalThis.fetch = async () => new Response('not JSON', { status: 200 });
  await assert.rejects(subscribeCall({ email: 'reader@example.com' }), /error subscribing/);
  globalThis.fetch = async () => { throw new Error('Offline'); };
  await assert.rejects(subscribeCall({ email: 'reader@example.com' }), /Offline/);
});
