import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Testing current authentication state at ${url}`);

const browser = await chromium.launch({ 
  headless: false, 
  slowMo: 1000
});

const context = await browser.newContext();
const page = await context.newPage();

// Listen for console messages
page.on('console', msg => {
  console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
});

try {
  console.log('[DEBUG] Going to main page...');
  await page.goto(url);
  
  // Wait for page to load and auth to initialize
  await page.waitForTimeout(8000);
  
  // Check the current authentication state
  const authState = await page.evaluate(() => {
    const result = {
      currentUrl: window.location.href,
      firebase: {
        authLoaded: typeof auth !== 'undefined',
        currentUser: null,
        isSignedIn: false
      },
      uiState: {
        signedOut: null,
        signedIn: null,
        loading: null
      }
    };
    
    // Check Firebase auth
    if (typeof auth !== 'undefined') {
      result.firebase.currentUser = auth.currentUser ? {
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        uid: auth.currentUser.uid
      } : null;
      result.firebase.isSignedIn = !!auth.currentUser;
    }
    
    // Check UI states
    const signedOut = document.getElementById('signed-out');
    const signedIn = document.getElementById('signed-in');
    const loading = document.getElementById('loading');
    
    result.uiState.signedOut = signedOut ? !signedOut.hidden : false;
    result.uiState.signedIn = signedIn ? !signedIn.hidden : false;
    result.uiState.loading = loading ? !loading.hidden : false;
    
    return result;
  });
  
  console.log('[DEBUG] Authentication state on main page:', JSON.stringify(authState, null, 2));
  
  // Now test going to dashboard directly
  console.log('[DEBUG] Now testing dashboard direct access...');
  await page.goto(url + '/dashboard.html');
  await page.waitForTimeout(8000);
  
  const dashboardState = await page.evaluate(() => {
    const result = {
      currentUrl: window.location.href,
      firebase: {
        authLoaded: typeof auth !== 'undefined',
        currentUser: null,
        isSignedIn: false
      },
      uiState: {
        loading: null,
        notSignedIn: null,
        dashboard: null
      }
    };
    
    // Check Firebase auth
    if (typeof auth !== 'undefined') {
      result.firebase.currentUser = auth.currentUser ? {
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        uid: auth.currentUser.uid
      } : null;
      result.firebase.isSignedIn = !!auth.currentUser;
    }
    
    // Check UI states
    const loading = document.getElementById('loading-state');
    const notSignedIn = document.getElementById('not-signed-in');
    const dashboard = document.getElementById('dashboard-content');
    
    result.uiState.loading = loading ? !loading.hidden : false;
    result.uiState.notSignedIn = notSignedIn ? !notSignedIn.hidden : false;
    result.uiState.dashboard = dashboard ? !dashboard.hidden : false;
    
    return result;
  });
  
  console.log('[DEBUG] Dashboard state:', JSON.stringify(dashboardState, null, 2));
  
} catch (error) {
  console.log(`[ERROR] ${error.message}`);
}

console.log('[DEBUG] Browser will close in 10 seconds...');
await page.waitForTimeout(10000);
await browser.close();
