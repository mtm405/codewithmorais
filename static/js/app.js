// static/js/app.js
// Main application entry point.
// This file orchestrates the initialization of all other modules.

import { initSidebar } from './sidebar.js';
import { initDashboard } from './dashboard.js';
import { initQuiz } from './quiz.js';
import { initHeader } from './header.js';
import { initLesson } from './lesson.js';
import { state } from './shared-state.js';

/**
 * @description A central registry for page-specific initializers.
 * This allows us to only run the scripts needed for the current page,
 * improving performance and preventing errors from scripts trying
 * to access elements that don't exist.
 */
const pageInitializers = {
    // Run on all pages
    common: [
        initSidebar,
        initHeader
    ],
    // Run only on the dashboard page
    dashboard: [
        initDashboard
    ],
    // Run only on lesson pages
    lesson: [
        initQuiz,
        initLesson
    ]
};

/**
 * @description Determines the current page based on the body's ID.
 * The Flask templates should set the body ID accordingly (e.g., <body id="dashboard-page">).
 * @returns {string} The name of the current page.
 */
function getCurrentPage() {
    return document.body.id || 'common';
}

/**
 * @description Initializes all necessary modules when the DOM is fully loaded.
 * It runs common initializers and any page-specific ones.
 */
function initializeApp() {
    const pageKey = getCurrentPage().replace('-page', '');

    // Run common initializers
    pageInitializers.common.forEach(init => {
        try {
            init();
        } catch (error) {
            console.error(`Error initializing common module ${init.name}:`, error);
        }
    });

    // Run page-specific initializers
    if (pageInitializers[pageKey]) {
        pageInitializers[pageKey].forEach(init => {
            try {
                init();
            } catch (error) {
                console.error(`Error initializing module ${init.name} for page ${pageKey}:`, error);
            }
        });
    }
}

// Wait for the DOM to be ready before initializing the app.
document.addEventListener('DOMContentLoaded', initializeApp);

// Expose the shared state to the window for easy debugging if needed
window.appState = state;
