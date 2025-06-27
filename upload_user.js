// upload_user.js
// Script to upload user.json to Firestore using Firebase Admin SDK

import admin from "firebase-admin";
import { readFileSync } from "fs";

// Load JSON files
const serviceAccount = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"));
const userData = JSON.parse(readFileSync("./user.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Replace with the actual Firebase Auth UID
const userId = "REPLACE_WITH_USER_UID";

db.collection("users").doc(userId).set(userData)
  .then(() => {
    console.log("User uploaded!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error uploading user:", err);
    process.exit(1);
  });
