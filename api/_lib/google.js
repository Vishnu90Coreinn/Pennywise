const crypto = require('crypto');
let tokenCache = { token: null, expires: 0 };
function b64url(input) { return Buffer.from(input).toString('base64url'); }
async function accessToken() {
  if (tokenCache.token && tokenCache.expires > Date.now() + 60000) return tokenCache.token;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key || !process.env.GOOGLE_SHEET_ID) throw new Error('Google Sheet credentials missing');
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({ iss: email, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const unsigned = head + '.' + body;
  const signer = crypto.createSign('RSA-SHA256'); signer.update(unsigned);
  const assertion = unsigned + '.' + signer.sign(key, 'base64url');
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }) });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error(data.error_description || data.error || 'Google token error');
  tokenCache = { token: data.access_token, expires: Date.now() + Number(data.expires_in || 3600) * 1000 };
  return tokenCache.token;
}
async function sheetsRequest(method, path, body) {
  const token = await accessToken();
  const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(process.env.GOOGLE_SHEET_ID) + path;
  const response = await fetch(url, { method, headers: { Authorization: 'Bearer ' + token, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error && data.error.message || 'Sheets API error');
  return data;
}
module.exports = { sheetsRequest };
