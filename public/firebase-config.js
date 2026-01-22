// Firebase configuration for Code with Morais platform
const firebaseConfig = {
  apiKey: "AIzaSyAIwwM2V2qfPCB3TLVVeb8IW3FGxdNDhiY",
  // Use the custom domain for auth callbacks so state is persisted on your site
  authDomain: "codewithmorais.com",
  projectId: "code-with-morais-405",
  storageBucket: "code-with-morais-405.firebasestorage.app",
  messagingSenderId: "208072504611",
  appId: "1:208072504611:web:8ebd20260a9e16ceff8896",
  measurementId: "G-JLH66GJNFL"
};

// Only try to initialize if Firebase compat SDK is available (for older pages)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase (compat) initialized successfully');
  } catch (error) {
    console.log('Firebase compat initialization skipped:', error.message);
  }
}

// Set on window for modular SDK pages
window.firebaseConfig = firebaseConfig;
