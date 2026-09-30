const crypto = require('crypto');
function sign() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const mac = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url');
  return payload + '.' + mac;
}
function verify(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const expected = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(parts[0]).digest();
    const actual = Buffer.from(parts[1], 'base64url');
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return false;
    return JSON.parse(Buffer.from(parts[0], 'base64url').toString()).exp > Date.now();
  } catch (_) { return false; }
}
function requireAuth(req, res) {
  if (!process.env.DATABASE_URL || !process.env.APP_PASSWORD || !process.env.SESSION_SECRET) { res.status(503).json({ error: 'Database access is not configured yet.' }); return false; }
  const c = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('pennywise_session='));
  if (!c || !verify(c.slice('pennywise_session='.length))) { res.status(401).json({ error: 'Please sign in to continue.' }); return false; }
  return true;
}
module.exports = { sign, verify, requireAuth };
