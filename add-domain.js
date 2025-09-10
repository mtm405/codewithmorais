const {GoogleAuth} = require('google-auth-library');
const fetch = require('node-fetch');
const fs = require('fs');

(async () => {
  const keyFile = 'C:/Users/marco/Downloads/code-with-morais-405-firebase-adminsdk-fbsvc-67216dc923.json';
  if (!fs.existsSync(keyFile)) {
    console.error('Service account file not found:', keyFile);
    process.exit(1);
  }

  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const auth = new GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const project = key.project_id;

  // Create domain mapping via Firebase Hosting API
  // POST https://firebasehosting.googleapis.com/v1beta1/sites/{site}/domains
  const site = project; // site name is usually the project id
  const url = `https://firebasehosting.googleapis.com/v1beta1/sites/${site}/domains`;

  const domain = 'codewithmorais.com';

  const res = await client.request({
    url,
    method: 'POST',
    data: {domain}
  });

  console.log('API response status:', res.status);
  console.log('Response data:', JSON.stringify(res.data, null, 2));
  if (res.data && res.data.site && res.data.domain && res.data.ownershipChallenge) {
    console.log('DNS records to add:');
    console.log(res.data.ownershipChallenge);
  }
})();
