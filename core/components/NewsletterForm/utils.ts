export const subscribeCall = async (data: { email: string }) => {
  const response = await fetch('/api/subscribe/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  let result: { error?: unknown; success?: unknown } | null = null;
  try {
    result = await response.json();
  } catch {
    // An invalid response must not be treated as a completed signup.
  }

  if (!response.ok || result?.success !== true || result.error) {
    throw new Error(
      typeof result?.error === 'string' && result.error
        ? result.error
        : 'There was an error subscribing to the newsletter'
    );
  }
};
