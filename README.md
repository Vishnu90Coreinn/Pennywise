# Pennywise Expense Tracker

A private, mobile-friendly personal expense tracker with income and expense entry, monthly totals, a savings-rate estimate, category breakdowns, and a savings goal. It can run in local-browser demo mode or sync transactions to a Google Sheet.

## Google Sheet format

Create a Google Sheet and add a tab named `Transactions` with this header row:

`Date | Type | Category | Note | Amount | CreatedAt`

Create a Google Cloud service account, enable the Google Sheets API, and share the Sheet with the service-account email as an Editor. Add the following Vercel environment variables:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (store the private key securely; use `\n` for line breaks if needed)
- `GOOGLE_SHEET_ID` (from the Sheet URL)
- `GOOGLE_SHEET_TAB` (optional; defaults to `Transactions`)
- `APP_PASSWORD` (a strong private app password)
- `SESSION_SECRET` (a long random secret)

Once those settings exist, the app will require the app password before loading or changing Sheet data. Without them, it stays in local-browser mode. Local-browser entries do not sync to Google Sheets.

## Run locally

Install Vercel CLI and run `npm run dev`. The static frontend works without Google credentials; API routes require the variables above to use Google Sheets.
