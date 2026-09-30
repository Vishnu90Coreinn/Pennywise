const { requireAuth } = require('./_lib/session');
const { getDatabase, ensureSchema } = require('./_lib/database');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'PUT'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  try {
    const sql = getDatabase();
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const rows = await sql`SELECT savings_goal FROM pennywise_settings WHERE id = 1`;
      return res.status(200).json({ goal: Number(rows[0].savings_goal) });
    }
    const goal = Number(req.body && req.body.goal);
    if (!Number.isFinite(goal) || goal < 0 || goal > 9999999999) return res.status(400).json({ error: 'Enter a valid savings goal.' });
    const rows = await sql`UPDATE pennywise_settings SET savings_goal = ${goal}, updated_at = NOW()
      WHERE id = 1 RETURNING savings_goal`;
    return res.status(200).json({ goal: Number(rows[0].savings_goal) });
  } catch (error) {
    console.error('Database settings request failed:', error.message);
    return res.status(503).json({ error: 'Could not reach the database. Check the Neon connection and try again.' });
  }
};
