// modules/quiz/index.js
// Main quiz logic (MCQ, currency, user tokens, etc.)

// Import Firebase modules as needed
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc as firestoreDoc, getDoc as firestoreGetDoc, updateDoc, setDoc as firestoreSetDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = window.firebaseConfig || {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function fetchLessonQuizFromStatic(lessonId) {
  try {
    const url = `/static/lessons/${lessonId}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch lesson JSON: " + res.status);
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch lesson quiz from static files:", e);
    return null;
  }
}

export async function updateUserTokensInFirebase(userId, newCurrencyAmount) {
  const userRef = firestoreDoc(db, "users", userId);
  const docSnap = await firestoreGetDoc(userRef);
  if (!docSnap.exists()) {
    await firestoreSetDoc(userRef, { currency: newCurrencyAmount });
  } else {
    await updateDoc(userRef, { currency: newCurrencyAmount });
  }
}

export function getCurrentUserId() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}

export async function fetchAndDisplayUserTokens() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    // ...existing logic...
  } catch {
    // ...existing logic...
  }
}
// ...other quiz logic as needed...
