// static/js/app.js

// --- Firebase Imports (Updated to use CDN paths) ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, signOut as firebaseSignOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// --- Global Firebase Instances (assigned values after initialization) ---
let firebaseApp;
let auth;
let db;

// --- Firebase Initialization Function ---
async function initializeFirebase() {
    console.log("DEBUG: initializeFirebase() started.");
    try {
        // __firebase_config is typically set in a <script> tag in base.html from Flask
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? __firebase_config : {};

        if (!firebaseConfig || Object.keys(firebaseConfig).length === 0 || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
            console.warn("Firebase config is missing or incomplete. Firebase features will be limited.");
            return; // Exit function if config is bad
        }

        if (!firebaseApp) { // Only initialize if not already initialized
            firebaseApp = initializeApp(firebaseConfig);
            auth = getAuth(firebaseApp);
            db = getFirestore(firebaseApp);
            console.log("DEBUG: Firebase initialized.");
        } else {
            console.log("DEBUG: Firebase already initialized.");
        }

        // Sign in anonymously if not already signed in (useful for public features)
        // This is primarily for the client-side Firebase SDK. Your Google OAuth handles actual user login.
        // If you don't need anonymous access for non-logged-in users, you can remove this.
        // if (!auth.currentUser) {
        //     await signInAnonymously(auth);
        //     console.log("DEBUG: Signed in anonymously.");
        // }

    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
}

// --- Event Listener for Logout Button ---
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();
            console.log("Logout button clicked.");
            try {
                // Try Firebase client-side logout first (if user was signed in with Firebase)
                if (auth && auth.currentUser) {
                    await firebaseSignOut(auth);
                    console.log("Firebase client-side sign out successful.");
                }

                // Then, redirect to your Flask /logout endpoint to clear session on server
                window.location.href = '/logout';
            } catch (error) {
                console.error("Error during logout:", error);
                alert("Error during logout. Please try again.");
            }
        });
    } else {
        console.warn("Logout button not found.");
    }
});

// --- Set Time-Based Greeting ---
function updateTimeBasedGreeting() {
    const greetingEl = document.getElementById('time-based-greeting');
    if (!greetingEl) return;
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good evening,';
    if (hour >= 5 && hour < 12) greeting = 'Good morning,';
    else if (hour >= 12 && hour < 18) greeting = 'Good afternoon,';
    // Get first name from user_name or user display name
    let firstName = '';
    const userNameEl = document.getElementById('user-name-display');
    if (userNameEl) {
        firstName = userNameEl.textContent.split(' ')[0];
        userNameEl.textContent = firstName;
    }
    greetingEl.textContent = `${greeting}`;
}
document.addEventListener('DOMContentLoaded', updateTimeBasedGreeting);

// Call initializeFirebase when app starts
initializeFirebase();

// You can add more global JavaScript logic here if needed
// For example, any common utilities not specific to sidebar or dashboard

// This listener is important for dynamic elements and ensuring Firebase is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DEBUG: app.js DOMContentLoaded fired.");

    try {
        // Wait for Firebase to be initialized and auth state to be known
        if (typeof auth !== 'undefined' && auth) {
            await new Promise(resolve => {
                onAuthStateChanged(auth, user => {
                    if (user) {
                        console.log("DEBUG: Firebase Auth State Changed - User is logged in (Firebase side).", user.uid);
                    } else {
                        console.log("DEBUG: Firebase Auth State Changed - No user (Firebase side).");
                    }
                    resolve();
                });
            });
        } else {
            console.warn("Firebase auth is not initialized. Skipping onAuthStateChanged.");
        }

        // Initialize Sortable.js only if a container exists for it (e.g., dashboard grid)
        // Removed specific dashboard-sortable-container logic as it's no longer used for layout
        // The import for Sortable.js is now handled directly in dashboard.html block scripts if needed.

        // Call fetchAndRenderLeaderboard only on dashboard page
        // The logic for fetching and rendering leaderboard is now in dashboard_logic.js
        // and is called there directly.
        const dashboardGridElement = document.querySelector('.dashboard-grid');
        if (dashboardGridElement) {
            console.log("DEBUG: '.dashboard-grid' element found.");
            // No need to call fetchAndRenderLeaderboard here, dashboard_logic.js will handle it.
        } else {
            console.log("DEBUG: '.dashboard-grid' element not found. Skipping dashboard-specific JS init.");
        }

        console.log("DEBUG: All app.js DOMContentLoaded tasks registered/attempted.");

    } catch (error) {
        console.error("CRITICAL ERROR: app.js DOMContentLoaded execution halted due to unhandled error:", error);
    }
}); // End of DOMContentLoaded
// REMINDER: Set your Firebase config in Flask and inject it as __firebase_config in your base.html template.
// Example: <script>var __firebase_config = '{{ firebase_config | tojson | safe }}';</script>
