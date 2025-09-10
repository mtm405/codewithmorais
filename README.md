# Student Activities (Firebase + Hosting) — Minimal Starter

This folder contains a minimal static website set up for Firebase Hosting and Firebase Authentication (Google Sign-In).

What I created for you (files and purpose):

- `public/index.html` — static single-page app with sign-in buttons and sample activities.
- `public/app.js` — client code using Firebase modular SDK (CDN) for Google sign-in and simple UI.
- `public/styles.css` — basic styles.
- `public/firebase-config.js.example` — example Firebase config. Copy to `public/firebase-config.js` and fill with your project's values.
- `firebase.json` — Firebase Hosting configuration (serves `public/`).
- `.firebaserc` — placeholder for your Firebase project id.

Requirements (what you need to install / configure):

1. Node.js and npm (to install Firebase CLI). Install from https://nodejs.org/ if you don't have it.
2. Firebase CLI: install globally:

```powershell
npm install -g firebase-tools
```

3. A Firebase project in the Firebase Console: https://console.firebase.google.com/

4. In the Firebase Console for your project:
   - Go to Authentication -> Sign-in method -> enable **Google**.
   - Add authorized domains (for local testing you can add `localhost`).
   - Go to Project settings -> General -> Your apps -> Add a Web app to get the config values (apiKey, authDomain, appId, etc.).

5. (Optional) If you need OAuth consent screen advanced configuration or publishing scopes, configure OAuth consent in the Google Cloud Console.

Setup & deploy (quick start):

1. Login to Firebase from your machine:

```powershell
firebase login
```

2. (One-time) Initialize your local repo to the Firebase project (or use `firebase use` to select an existing one):

```powershell
# If you haven't linked a project yet:
firebase init hosting
# When prompted, select your Firebase project, set public directory to 'public', and choose single-page app = yes if asked.
```

3. Copy the config example and fill values:

```powershell
copy .\public\firebase-config.js.example .\public\firebase-config.js
# then edit public\firebase-config.js to paste your project values
```

4. Serve locally to test (recommended):

```powershell
# Serve hosting locally
firebase hosting:serve
# or emulate (hosting + auth emulators) if you set up emulators
firebase emulators:start --only hosting
```

5. Deploy to Firebase Hosting:

```powershell
firebase deploy --only hosting
```

Notes and next steps:
- This starter uses the Firebase JS SDK via CDN for simplicity. For production, consider bundling with a build tool and pinning SDK versions.
- Do not commit your real `public/firebase-config.js` to public repos if you care about secrecy (the config keys are not secret by themselves but best practice is to avoid accidental leak of other secrets).
- If you need server-side logic (grading, secure data), add `functions/` and use Cloud Functions (see Firebase docs).

If you want, I can:
- Walk you through creating the Firebase project and enabling Google sign-in step-by-step.
- Initialize the project with `firebase init` from this machine (requires you to run login in terminal so I can link it), or provide exact commands to run.
- Add a Cloud Firestore data model for storing activity results.

Which of those would you like next?

Cloud Run (Docker) — optional alternative hosting for a Python-backed app
--------------------------------------------------------------------

If your previous project includes a Python backend (Flask/Django) and you prefer to keep the server-side code, you can containerize and deploy to Google Cloud Run. This repo now includes a `Dockerfile` and a GitHub Actions workflow template at `.github/workflows/cloud-run-deploy.yml`.

Quick local build & run:

```powershell
# build
docker build -t student-activities:local .
# run locally (maps to port 8080)
docker run --rm -p 8080:8080 student-activities:local
```

Create a service account and key for GitHub Actions:

1. In GCP Console, go to IAM & Admin -> Service accounts -> Create Service Account.
2. Give it the roles: Cloud Run Admin, Storage Admin (or Storage Object Admin), and Service Account User.
3. Create a JSON key and copy its contents.
4. In your GitHub repo, create two secrets:
   - `GCP_PROJECT` = your GCP project id
   - `GCP_SA_KEY` = the JSON key contents

The provided workflow will build the container, push it to `gcr.io/$GCP_PROJECT/student-activities:<sha>` and deploy it to Cloud Run. Adjust region and service name in `.github/workflows/cloud-run-deploy.yml` if needed.

DNS and custom domain:
- If you deploy to Cloud Run and want to use your own domain, configure the domain mapping in GCP (Cloud Run -> Domain mappings) and add the DNS records shown there at your registrar. Cloud Run will provision a TLS certificate automatically.

Notes:
- Cloud Run may require enabling billing on the project for production traffic.
- If your app is purely static (no server logic), Firebase Hosting is simpler and may be cheaper.

Cleaning / node_modules (important)
----------------------------------

You should NOT commit the `node_modules/` folder to source control. Reasons:

- It's large and would bloat the repository history.
- Packages are rebuildable from `package.json` / `package-lock.json` (or `yarn.lock`).
- Different environments/platforms can install platform-specific binaries — keep the source manifest instead.

If you have a local `node_modules/` directory and want to clean it up or regenerate dependencies, run these PowerShell commands locally:

```powershell
# remove the installed modules and lockfile (if you want a clean reinstall)
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force .\package-lock.json -ErrorAction SilentlyContinue

# reinstall from package.json (creates a fresh package-lock.json)
npm install
```

Notes:
- The repo already contains a `.gitignore` that excludes `node_modules/`.
- Keep `package.json` (it describes dev tooling and dependencies). If the project has no Node build step, it's safe to keep it minimal or remove it later.

If you want, I can remove `node_modules/` from the workspace now (if present) and run a fresh `npm install` — say "clean now" and I'll run the commands here.

