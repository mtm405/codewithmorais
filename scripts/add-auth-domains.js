// scripts/add-auth-domains.js
// Usage: node scripts/add-auth-domains.js <service-account.json> <project-id> domain1 domain2 ...
// Example: node scripts/add-auth-domains.js ../service-account.json code-with-morais-405 codewithmorais.com www.codewithmorais.com

const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node scripts/add-auth-domains.js <service-account.json> <project-id> domain1 [domain2 ...]');
    process.exit(1);
  }
  const saPath = path.resolve(args[0]);
  const projectId = args[1];
  const domainsToAdd = args.slice(2);

  if (!fs.existsSync(saPath)) {
    console.error('Service account file not found at', saPath);
    process.exit(2);
  }

  const auth = new GoogleAuth({ keyFilename: saPath, scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/identitytoolkit'] });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = tokenResponse && tokenResponse.token ? tokenResponse.token : tokenResponse;
  if (!token) {
    console.error('Failed to obtain access token');
    process.exit(3);
  }

  const baseUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;

  // Get current config
  const getRes = await fetch(baseUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!getRes.ok) {
    const text = await getRes.text();
    console.error('Failed to GET current config:', getRes.status, text);
    process.exit(4);
  }
  const current = await getRes.json();
  // Dump full config so we can inspect the exact field names expected by the API
  console.log('Full project config:');
  console.log(JSON.stringify(current, null, 2));
  // authorizedDomains is a top-level field in the config response
  const existing = current.authorizedDomains || [];
  console.log('Existing domains:', existing);

  const merged = Array.from(new Set([...existing, ...domainsToAdd]));
  console.log('Merged domains:', merged);

  const body = { authorizedDomains: merged };
  const params = '?updateMask=authorizedDomains';
  const patchRes = await fetch(baseUrl + params, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const patchText = await patchRes.text();
  try {
    const patchJson = JSON.parse(patchText);
    if (!patchRes.ok) {
      console.error('PATCH failed:', patchRes.status, patchJson);
      process.exit(5);
    }
    console.log('Updated project config:', JSON.stringify(patchJson, null, 2));
  } catch (e) {
    console.error('Failed to parse PATCH response:', patchText);
    process.exit(6);
  }
}

main().catch(err => { console.error(err); process.exit(99); });
