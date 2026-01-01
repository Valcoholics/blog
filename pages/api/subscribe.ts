import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  error?: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.length) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!API_KEY || !AUDIENCE_ID || !SERVER_PREFIX) {
    return res.status(500).json({
      error: 'Mailchimp configuration is missing',
    });
  }

  const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
      }),
    });

    const data = await response.json();

    if (response.status >= 400) {
      // Check if user is already subscribed
      if (data.title === 'Member Exists') {
        return res.status(400).json({
          error: 'You are already subscribed to this newsletter',
        });
      }

      return res.status(400).json({
        error: data.detail || 'There was an error subscribing to the newsletter',
      });
    }

    return res.status(201).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      error: 'There was an error subscribing to the newsletter',
    });
  }
}
