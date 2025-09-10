import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Testing authentication issue at ${url}`);

const browser = await chromium.launch({ 
  headless: false, 
  slowMo: 1000,
  args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
});

const context = await browser.newContext({
  // Enable permissions for geolocation, notifications, etc.
  permissions: ['geolocation', 'notifications']
});

const page = await context.newPage();

// Listen for console messages
page.on('console', msg => {
  console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
});

// Listen for page errors
page.on('pageerror', error => {
  console.log(`[PAGE ERROR] ${error.message}`);
});

try {
  // Navigate to dashboard directly to simulate the issue
  console.log('[DEBUG] Going directly to dashboard...');
  await page.goto(url + '/dashboard.html');
  
  // Wait for the page to load and Firebase to initialize
  await page.waitForTimeout(5000);
  
  // Get detailed debug info
  const debugInfo = await page.evaluate(() => {
    const result = {
      url: window.location.href,
      firebase: {
        authLoaded: typeof auth !== 'undefined',
        currentUser: null,
        isSignedIn: false
      },
      elements: {
        loadingState: null,
        notSignedIn: null,
        dashboardContent: null
      },
      console: []
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
    
    // Check DOM elements
    const loadingState = document.getElementById('loading-state');
    const notSignedIn = document.getElementById('not-signed-in');
    const dashboardContent = document.getElementById('dashboard-content');
    
    result.elements.loadingState = loadingState ? {
      exists: true,
      hidden: loadingState.hidden,
      innerHTML: loadingState.innerHTML.substring(0, 200)
    } : { exists: false };
    
    result.elements.notSignedIn = notSignedIn ? {
      exists: true,
      hidden: notSignedIn.hidden,
      innerHTML: notSignedIn.innerHTML.substring(0, 200)
    } : { exists: false };
    
    result.elements.dashboardContent = dashboardContent ? {
      exists: true,
      hidden: dashboardContent.hidden
    } : { exists: false };
    
    return result;
  });
  
  console.log('[DEBUG] Dashboard debug info:', JSON.stringify(debugInfo, null, 2));
  
  // Wait a bit more to see if anything changes
  console.log('[DEBUG] Waiting for auth state to settle...');
  await page.waitForTimeout(8000);
  
  // Check again
  const finalState = await page.evaluate(() => {
    const loadingState = document.getElementById('loading-state');
    const notSignedIn = document.getElementById('not-signed-in');
    const dashboardContent = document.getElementById('dashboard-content');
    
    return {
      loading: loadingState ? !loadingState.hidden : false,
      notSignedIn: notSignedIn ? !notSignedIn.hidden : false,
      dashboard: dashboardContent ? !dashboardContent.hidden : false,
      authState: typeof auth !== 'undefined' && auth.currentUser ? 'signed in' : 'not signed in'
    };
  });
  
  console.log('[DEBUG] Final state:', JSON.stringify(finalState, null, 2));
  
} catch (error) {
  console.log(`[ERROR] ${error.message}`);
}

// Keep browser open for manual inspection
console.log('[DEBUG] Browser will close in 10 seconds...');
await page.waitForTimeout(10000);
await browser.close();
