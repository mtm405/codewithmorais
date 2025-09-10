// scripts/get-google-oauth.js
// Usage: node scripts/get-google-oauth.js <service-account.json> <project-id>
const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/get-google-oauth.js <service-account.json> <project-id>');
    process.exit(1);
  }
  const saPath = path.resolve(args[0]);
  const projectId = args[1];
  if (!fs.existsSync(saPath)) { console.error('Service account missing at', saPath); process.exit(2); }
  const auth = new GoogleAuth({ keyFilename: saPath, scopes: ['https://www.googleapis.com/auth/identitytoolkit'] });
  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  const token = tokenRes && tokenRes.token ? tokenRes.token : tokenRes;
  if (!token) { console.error('Failed to get access token'); process.exit(3); }
  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/oauthIdpConfigs/google.com`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  console.log('HTTP', res.status);
  try { console.log(JSON.stringify(JSON.parse(text), null, 2)); } catch(e) { console.log(text); }
}

main().catch(e=>{ console.error(e); process.exit(99); });
