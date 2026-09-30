# Pennywise Expense Tracker

A private, mobile-friendly expense tracker with income and expense entry, monthly totals, savings insights, category breakdowns, and a savings goal. When configured, it stores transactions and the savings goal in Neon Postgres. Without database credentials, it runs in local-browser demo mode.

## Connect a free Neon database through Vercel

1. In Vercel, open the Pennywise project and go to **Storage** or **Marketplace**.
2. Install **Neon** and select its free plan. Connect it to the Pennywise project for Production (and Preview if you want preview deployments to use the database).
3. Vercel adds the database connection variable, usually `DATABASE_URL`, to the project. Create a new deployment after connecting the database.
4. In **Settings → Environment Variables**, add:
   - `APP_PASSWORD`: a strong password for the tracker.
   - `SESSION_SECRET`: a long random secret used to sign login sessions.
5. Redeploy after changing environment variables.

The app creates its transactions and settings tables automatically the first time an authenticated request reaches the API. It stores transaction date, type, category, note, amount, and creation time, along with the savings goal. Database credentials are used only by server-side API routes.

## Environment variables

- `DATABASE_URL` — supplied by the Neon Vercel integration.
- `APP_PASSWORD` — password used to unlock the private tracker.
- `SESSION_SECRET` — long random session-signing key.

For local development, copy `.env.example` to `.env.local`, fill in these values, then run `npm install` and `npm run dev` with the Vercel CLI installed.

## Data note

The app now writes to Postgres. Existing transactions in a Google Sheet are not imported automatically, so keep the Sheet as a backup if it already contains data. The app does not need Google Sheets credentials.
