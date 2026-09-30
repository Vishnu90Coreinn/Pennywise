const { neon } = require('@neondatabase/serverless');

let schemaPromise;

function getDatabase() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}

async function ensureSchema(sql) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS pennywise_transactions (
        id BIGSERIAL PRIMARY KEY,
        transaction_date DATE NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        category VARCHAR(50) NOT NULL,
        note VARCHAR(120) NOT NULL DEFAULT '',
        amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS pennywise_settings (
        id SMALLINT PRIMARY KEY CHECK (id = 1),
        savings_goal NUMERIC(12, 2) NOT NULL DEFAULT 20000,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`INSERT INTO pennywise_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
    })().catch(error => {
      schemaPromise = undefined;
      throw error;
    });
  }
  await schemaPromise;
}

module.exports = { getDatabase, ensureSchema };
