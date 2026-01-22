// Script to clear all student progress data from def-practice.html
// Run this with: node clear-progress.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIwwM2V2qfPCB3TLVVeb8IW3FGxdNDhiY",
  authDomain: "codewithmorais.com",
  projectId: "code-with-morais-405",
  storageBucket: "code-with-morais-405.firebasestorage.app",
  messagingSenderId: "208072504611",
  appId: "1:208072504611:web:8ebd20260a9e16ceff8896",
  measurementId: "G-JLH66GJNFL"
};

async function clearAllProgressData() {
  console.log('🚀 Starting complete progress data cleanup...');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Collections to clear that store student progress
    const collectionsToClear = [
      'quizProgress',        // Student progress in def-practice.html
      'quizResults',         // Quiz results from def-quiz.html
      'liveLeaderboard',     // Leaderboard data
      'securityViolations'   // Security logs
    ];
    
    let totalDeleted = 0;
    
    for (const collectionName of collectionsToClear) {
      console.log(`🗑️ Clearing collection: ${collectionName}`);
      
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      if (querySnapshot.empty) {
        console.log(`   ℹ️ Collection ${collectionName} is already empty`);
        continue;
      }
      
      console.log(`   📊 Found ${querySnapshot.size} documents to delete`);
      
      // Delete all documents in batches
      const deletePromises = [];
      querySnapshot.forEach((documentSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, collectionName, documentSnapshot.id)));
      });
      
      await Promise.all(deletePromises);
      
      console.log(`   ✅ Deleted ${querySnapshot.size} documents from ${collectionName}`);
      totalDeleted += querySnapshot.size;
    }
    
    console.log(`🎯 CLEANUP COMPLETE!`);
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log(`🧹 All student progress has been reset to zero`);
    console.log(`✅ Students can now start fresh on def-practice.html`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
clearAllProgressData();