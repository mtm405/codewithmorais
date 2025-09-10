// Script: scripts/check-hosting-domain.js
// Purpose: Query Firebase Hosting domains for the site and print verification/SSL state.
// Usage: node scripts/check-hosting-domain.js [path-to-service-account.json] [site-id]
// If you don't provide path, it will look for ./service-account.json. If you don't provide site-id, it will use 'code-with-morais-405'.

const path = require('path');
const fs = require('fs');
const {GoogleAuth} = require('google-auth-library');

async function tryFetch(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, body: JSON.parse(text) }; } catch(e) { return { ok: res.ok, status: res.status, body: text }; }
}

async function main() {
  const saPath = process.argv[2] || path.join(process.cwd(), 'service-account.json');
  const siteId = process.argv[3] || 'code-with-morais-405';

  if (!fs.existsSync(saPath)) {
    console.error('Service account not found at', saPath);
    console.error('Please place your service account JSON in the workspace as service-account.json or pass its path as the first argument.');
    process.exit(2);
  }

  const auth = new GoogleAuth({ keyFilename: saPath, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const token = accessTokenResponse && accessTokenResponse.token ? accessTokenResponse.token : accessTokenResponse;
  if (!token) {
    console.error('Failed to obtain access token.');
    process.exit(3);
  }

  // Try likely endpoints. We'll attempt the v1beta1 sites/{site}/domains endpoint first.
  const endpoints = [
    `https://firebasehosting.googleapis.com/v1beta1/sites/${siteId}/domains`,
    `https://firebasehosting.googleapis.com/v1beta1/projects/${siteId}/sites/${siteId}/domains`,
    `https://firebasehosting.googleapis.com/v1/sites/${siteId}/domains`,
  ];

  for (const url of endpoints) {
    try {
      console.log('\nTrying:', url);
      const result = await tryFetch(url, token);
      console.log('HTTP', result.status);
      if (result.ok) {
        console.log('Result body:');
        console.dir(result.body, { depth: 5 });
        // If we get domains list, print a compact summary if possible
        if (result.body && result.body.domains) {
          console.log('\nDomains summary:');
          result.body.domains.forEach(d => {
            console.log(`- ${d.domain}: status=${d.status || d.domainRedirect && d.domainRedirect.type || 'unknown'}`);
            if (d.sslInfo) console.log(`  ssl: ${d.sslInfo.latestIssue || d.sslInfo.certificateState || JSON.stringify(d.sslInfo)}`);
            if (d.site) console.log(`  site: ${d.site}`);
            if (d.ownershipChallenge) console.log(`  ownershipChallenge: ${JSON.stringify(d.ownershipChallenge)}`);
          });
        }
        process.exit(0);
      } else {
        console.error('Non-OK response:', result.body);
      }
    } catch (err) {
      console.error('Error calling endpoint:', err.message || err);
    }
  }

  console.error('\nAll endpoints failed. If you get 403/401, check the service-account permissions (needs Firebase Hosting Admin or Owner).');
  process.exit(4);
}

main().catch(err => { console.error(err); process.exit(1); });
