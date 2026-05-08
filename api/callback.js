export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    const response = await fetch(`${process.env.NYLAS_API_URI}/v3/connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.NYLAS_CLIENT_ID,
        client_secret: process.env.NYLAS_API_KEY,
        redirect_uri: `https://${req.headers.host}/api/callback`,
        code,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();
    const grantId = data.grant_id;

    res.redirect(`/?grant_id=${grantId}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
