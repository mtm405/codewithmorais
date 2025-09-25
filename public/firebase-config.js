// Firebase configuration for Code with Morais platform
export const firebaseConfig = {
  apiKey: "AIzaSyAIwwM2V2qfPCB3TLVVeb8IW3FGxdNDhiY",
  // Use the custom domain for auth callbacks so state is persisted on your site
  authDomain: "codewithmorais.com",
  projectId: "code-with-morais-405",
  storageBucket: "code-with-morais-405.firebasestorage.app",
  messagingSenderId: "208072504611",
  appId: "1:208072504611:web:8ebd20260a9e16ceff8896",
  measurementId: "G-JLH66GJNFL"
};

// Also set on window for backward compatibility
window.firebaseConfig = firebaseConfig;
