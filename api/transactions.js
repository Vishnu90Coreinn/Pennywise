const { requireAuth } = require('./_lib/session');
const { getDatabase, ensureSchema } = require('./_lib/database');

function mapTransaction(row) {
  return {
    id: String(row.id),
    date: String(row.transaction_date),
    type: row.type,
    category: row.category,
    note: row.note || '',
    amount: Number(row.amount)
  };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  try {
    const sql = getDatabase();
    await ensureSchema(sql);

    if (req.method === 'GET') {
      const rows = await sql`SELECT id, transaction_date, type, category, note, amount
        FROM pennywise_transactions ORDER BY transaction_date DESC, id DESC`;
      return res.status(200).json({ transactions: rows.map(mapTransaction) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const amount = Number(body.amount);
      const date = String(body.date || '');
      const category = String(body.category || '').trim();
      if (!['income', 'expense'].includes(body.type) || !Number.isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !category) {
        return res.status(400).json({ error: 'Check the amount, date, type, and category.' });
      }
      const rows = await sql`INSERT INTO pennywise_transactions (transaction_date, type, category, note, amount)
        VALUES (${date}, ${body.type}, ${category.slice(0, 50)}, ${String(body.note || '').slice(0, 120)}, ${amount})
        RETURNING id, transaction_date, type, category, note, amount`;
      return res.status(201).json({ transaction: mapTransaction(rows[0]) });
    }

    const id = String(req.query && req.query.id || '');
    if (!/^\d+$/.test(id) || id === '0') return res.status(400).json({ error: 'Invalid transaction id.' });
    await sql`DELETE FROM pennywise_transactions WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Database request failed:', error.message);
    return res.status(503).json({ error: 'Could not reach the database. Check the Neon connection and try again.' });
  }
};
