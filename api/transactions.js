const { requireAuth } = require('./_lib/session');
const { sheetsRequest } = require('./_lib/google');
const range = (process.env.GOOGLE_SHEET_TAB || 'Transactions').replace(/'/g, "''");
const sheetRange = "'" + range + "'!A:F";
function rowToTransaction(row, index) {
  return { id: String(index + 2), date: String(row[0] || ''), type: String(row[1] || 'expense'), category: String(row[2] || 'Other'), note: String(row[3] || ''), amount: Number(row[4] || 0) };
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;
  try {
    if (req.method === 'GET') {
      const data = await sheetsRequest('GET', '/values/' + encodeURIComponent(sheetRange));
      const rows = data.values || [];
      const transactions = rows.slice(1).map((row, i) => rowToTransaction(row, i)).filter(t => t.date && Number.isFinite(t.amount));
      return res.status(200).json({ transactions });
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      if (!['income', 'expense'].includes(b.type) || !Number.isFinite(Number(b.amount)) || Number(b.amount) <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || !String(b.category || '').trim()) return res.status(400).json({ error: 'Check the amount, date, type, and category.' });
      const values = [[b.date, b.type, String(b.category).slice(0, 50), String(b.note || '').slice(0, 120), Number(b.amount), new Date().toISOString()]];
      await sheetsRequest('POST', '/values/' + encodeURIComponent(sheetRange) + ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS', { values, majorDimension: 'ROWS' });
      const read = await sheetsRequest('GET', '/values/' + encodeURIComponent(sheetRange));
      const rows = read.values || [];
      return res.status(201).json({ transaction: rowToTransaction(values[0], rows.length - 2) });
    }
    const id = Number(req.query && req.query.id);
    if (!Number.isInteger(id) || id < 2) return res.status(400).json({ error: 'Invalid transaction id.' });
    await sheetsRequest('POST', '/values/' + encodeURIComponent("'" + range + "'!A" + id + ':F' + id) + ':clear', {});
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Google Sheets request failed:', error.message);
    return res.status(502).json({ error: 'Could not reach Google Sheets. Check the sheet setup and try again.' });
  }
};
