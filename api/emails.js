export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { grant_id } = req.query;
  if (!grant_id) return res.status(400).json({ error: 'No grant_id' });

  const keywords = [
    'netflix','spotify','amazon prime','adobe','microsoft','linkedin',
    'disney','duolingo','coursera','xbox','apple music','youtube premium',
    'canva','zoom','dropbox','github','notion','figma','chatgpt','claude',
    'اشتراك','تجديد','فاتورة','subscription','invoice','renewal','billing',
    'your receipt','payment confirmation','order confirmation'
  ];

  try {
    const results = [];
    for (const keyword of keywords.slice(0, 15)) {
      const response = await fetch(
        `${process.env.NYLAS_API_URI}/v3/grants/${grant_id}/messages?` +
        new URLSearchParams({ subject: keyword, limit: 1 }),
        {
          headers: {
            Authorization: `Bearer ${process.env.NYLAS_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const msg = data.data[0];
        const date = new Date(msg.date * 1000);
        const monthsAgo = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24 * 30));
        results.push({
          name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          lastEmail: date.toLocaleDateString('ar-SA'),
          monthsAgo,
          forgotten: monthsAgo > 3,
          subject: msg.subject,
          from: msg.from?.[0]?.email || '',
        });
      }
    }
    res.json({ subscriptions: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
