export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientId = process.env.NYLAS_CLIENT_ID;
  const apiUri = process.env.NYLAS_API_URI;
  const host = req.headers.host;
  const redirectUri = `https://${host}/api/callback`;
  const provider = req.query.provider || 'google';

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      access_type: 'online',
      provider,
    });

    if (provider === 'google') {
      params.append('scope', 'https://www.googleapis.com/auth/gmail.readonly');
    }

    const authUrl = `${apiUri}/v3/connect/auth?${params}`;
    res.json({ url: authUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
