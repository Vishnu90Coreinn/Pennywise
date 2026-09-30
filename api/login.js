const { sign } = require('./_lib/session');
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) return res.status(503).json({ error: 'App password is not configured.' });
  if (!req.body || req.body.password !== process.env.APP_PASSWORD) return res.status(401).json({ error: 'That password did not match.' });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', 'pennywise_session=' + sign() + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000' + secure);
  return res.status(200).json({ ok: true });
};
