export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientId = process.env.NYLAS_CLIENT_ID;
  const apiUri = process.env.NYLAS_API_URI;
  const redirectUri = `https://${req.headers.host}/api/callback`;

  const authUrl = `${apiUri}/v3/connect/auth?` + new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'online',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
  });

  res.json({ url: authUrl });
}
