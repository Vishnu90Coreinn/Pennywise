module.exports = (req, res) => {
  const configured = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID && process.env.APP_PASSWORD && process.env.SESSION_SECRET);
  res.setHeader('Cache-Control', 'no-store');
  if (!configured) return res.status(200).json({ configured: false });
  const token = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('pennywise_session='));
  const session = token && require('./_lib/session').verify(token.slice('pennywise_session='.length));
  return res.status(200).json({ configured: true, authenticated: Boolean(session) });
};
