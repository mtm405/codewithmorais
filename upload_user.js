// upload_user.js
// Script to upload user.json to Firestore using Firebase Admin SDK

const admin = require('firebase-admin');
const fs = require('fs');

// Path to your Firebase service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load user data from user.json
const userData = require('./user.json');
const userId = 'REPLACE_WITH_USER_UID'; // <-- Replace with the actual Firebase Auth UID

db.collection('users').doc(userId).set(userData)
  .then(() => {
    console.log('User uploaded!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error uploading user:', err);
    process.exit(1);
  });
