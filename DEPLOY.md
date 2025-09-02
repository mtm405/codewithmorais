Deploying to Cloud Run (automated via GitHub Actions)
===================================================

This guide will help you configure Google Cloud and GitHub to allow automated deploys from the `feature/deploy` branch.

1) Create a GCP service account for CI
   - In Google Cloud Console, go to IAM & Admin → Service Accounts → Create Service Account.
   - Grant roles: Cloud Run Admin, Cloud Build Editor, Secret Manager Admin, Storage Admin (for Container Registry).
   - Create and download a JSON key. Keep it safe.

2) Create a secret in GitHub
   - In your GitHub repo settings → Secrets → Actions, add:
     - `GCP_SA_KEY` → the service account JSON content
     - `GCP_PROJECT` → your GCP project id
     - `GCP_REGION` → (e.g., `us-central1`)
     - `FIREBASE_SA_JSON` → the content of `serviceAccountKey.json` (Firebase admin SDK JSON)
     - `GOOGLE_CLIENT_ID` → your OAuth client id used by the frontend

3) Push to `feature/deploy`
   - The workflow `.github/workflows/cloudrun-deploy.yml` will trigger on push to `feature/deploy`.

4) After the workflow completes, map your domain in Cloud Run
   - Cloud Console → Cloud Run → codewithmorais → Domain mappings → Add mapping for `codewithmorais.com` and `www.codewithmorais.com`.
   - Verify domain ownership (TXT record) and update DNS records at your registrar as instructed.

5) Update OAuth & Firebase
   - Google Cloud Console → Credentials → OAuth 2.0 Client IDs: Add `https://codewithmorais.com` and `https://www.codewithmorais.com` as authorized JavaScript origins and redirect URIs used by your app.
   - Firebase Console → Auth → Authorized domains: add `codewithmorais.com`.

Notes
-----
- Do not commit `serviceAccountKey.json` to git. Use GitHub Secrets or Secret Manager.
- The workflow uses Secret Manager to store the Firebase admin JSON and then mounts it at deploy time as an env var `SERVICE_ACCOUNT_JSON` for the running container.
