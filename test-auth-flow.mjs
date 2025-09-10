import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Testing complete auth flow at ${url}`);

const browser = await chromium.launch({ headless: false, slowMo: 500 });
const page = await browser.newPage();

// Listen for console messages
page.on('console', msg => {
  console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
});

// Listen for page errors
page.on('pageerror', error => {
  console.log(`[PAGE ERROR] ${error.message}`);
});

try {
  // Navigate to the main page
  await page.goto(url);
  console.log('[DEBUG] Loaded main page');
  
  // Wait for auth to initialize
  await page.waitForTimeout(3000);
  
  // Check current auth state
  const authState = await page.evaluate(() => {
    const authLoading = document.getElementById('auth-loading');
    const authSignedOut = document.getElementById('auth-signed-out');
    const authSignedIn = document.getElementById('auth-signed-in');
    const status = document.getElementById('status');
    
    return {
      loading: authLoading ? !authLoading.hidden : false,
      signedOut: authSignedOut ? !authSignedOut.hidden : false,
      signedIn: authSignedIn ? !authSignedIn.hidden : false,
      status: status ? status.textContent : 'No status element'
    };
  });
  
  console.log('[DEBUG] Main page auth state:', JSON.stringify(authState, null, 2));
  
  // Now check dashboard directly
  await page.goto(url + '/dashboard.html');
  console.log('[DEBUG] Loaded dashboard page');
  
  // Wait for dashboard auth to initialize
  await page.waitForTimeout(5000);
  
  // Check dashboard auth state
  const dashboardState = await page.evaluate(() => {
    const loadingState = document.getElementById('loading-state');
    const notSignedIn = document.getElementById('not-signed-in');
    const dashboardContent = document.getElementById('dashboard-content');
    
    return {
      loading: loadingState ? !loadingState.hidden : false,
      notSignedIn: notSignedIn ? !notSignedIn.hidden : false,
      dashboard: dashboardContent ? !dashboardContent.hidden : false,
      currentUser: typeof auth !== 'undefined' && auth.currentUser ? auth.currentUser.email : 'No current user'
    };
  });
  
  console.log('[DEBUG] Dashboard auth state:', JSON.stringify(dashboardState, null, 2));
  
} catch (error) {
  console.log(`[ERROR] ${error.message}`);
}

await page.waitForTimeout(3000);
await browser.close();
