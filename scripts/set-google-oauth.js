// scripts/set-google-oauth.js
// Usage: node scripts/set-google-oauth.js <service-account.json> <project-id> <client-id> <client-secret>

const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error('Usage: node scripts/set-google-oauth.js <service-account.json> <project-id> <client-id> <client-secret>');
    process.exit(1);
  }
  const saPath = path.resolve(args[0]);
  const projectId = args[1];
  const clientId = args[2];
  const clientSecret = args[3];

  if (!fs.existsSync(saPath)) {
    console.error('Service account file not found at', saPath);
    process.exit(2);
  }

  const auth = new GoogleAuth({ keyFilename: saPath, scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/identitytoolkit'] });
  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  const token = tokenRes && tokenRes.token ? tokenRes.token : tokenRes;
  if (!token) { console.error('Failed to get access token'); process.exit(3); }

  const providerName = `projects/${projectId}/oauthIdpConfigs/google.com`;
  const url = `https://identitytoolkit.googleapis.com/admin/v2/${providerName}`;

  // GET current provider
  const getRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!getRes.ok && getRes.status !== 404) {
    const text = await getRes.text();
    console.error('GET provider failed:', getRes.status, text);
    process.exit(4);
  }
  if (getRes.status === 404) {
    console.log('Provider not found; will create/patch via PATCH call.');
  } else {
    const body = await getRes.json();
    console.log('Existing provider config:', JSON.stringify(body, null, 2));
  }

  const patchUrl = url + '?updateMask=clientId,clientSecret,enabled';
  const patchBody = { clientId: clientId, clientSecret: clientSecret, enabled: true };

  const patchRes = await fetch(patchUrl, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(patchBody)
  });
  const patchText = await patchRes.text();
  if (patchRes.status === 404) {
    console.log('PATCH returned 404; attempting to create provider via POST');
    const createUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/oauthIdpConfigs?oauthIdpConfigId=google.com`;
    const createBody = { name: `projects/${projectId}/oauthIdpConfigs/google.com`, clientId, clientSecret, enabled: true };
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(createBody)
    });
    const createText = await createRes.text();
    try {
      const createJson = JSON.parse(createText);
      if (!createRes.ok) {
        console.error('Create failed:', createRes.status, createJson);
        process.exit(7);
      }
      console.log('Created provider config:', JSON.stringify(createJson, null, 2));
    } catch (e) {
      console.error('Failed to parse create response:', createText);
      process.exit(8);
    }
  } else {
    try {
      const patchJson = JSON.parse(patchText);
      if (!patchRes.ok) {
        console.error('PATCH failed:', patchRes.status, patchJson);
        process.exit(5);
      }
      console.log('Updated provider config:', JSON.stringify(patchJson, null, 2));
    } catch (e) {
      console.error('Failed to parse PATCH response:', patchText);
      process.exit(6);
    }
  }
  
  // If PATCH returned 404, try to create the provider using the collection POST
  if (false) {
    // placeholder to keep structure
  }
}

main().catch(err => { console.error(err); process.exit(99); });
