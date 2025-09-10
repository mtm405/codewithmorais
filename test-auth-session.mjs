import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Testing for existing authentication session`);

const browser = await chromium.launch({ 
  headless: false, 
  slowMo: 500
});

// Use a persistent context to maintain session
const context = await browser.newContext({
  permissions: ['geolocation', 'notifications']
});

const page = await context.newPage();

// Listen for console messages
page.on('console', msg => {
  console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
});

try {
  console.log('[TEST] Going to main page to check for existing auth...');
  await page.goto(url);
  await page.waitForTimeout(5000);
  
  // Check if user is already signed in
  const authState = await page.evaluate(() => {
    return {
      currentUser: typeof auth !== 'undefined' && auth.currentUser ? {
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName
      } : null,
      authLoaded: typeof auth !== 'undefined'
    };
  });
  
  console.log('[TEST] Current auth state:', JSON.stringify(authState, null, 2));
  
  if (authState.currentUser) {
    console.log('[TEST] User is already signed in! Testing dashboard access...');
    await page.goto(url + '/dashboard.html');
    await page.waitForTimeout(8000);
    
    const dashboardState = await page.evaluate(() => {
      return {
        currentUser: typeof auth !== 'undefined' && auth.currentUser ? {
          email: auth.currentUser.email
        } : null,
        uiState: {
          loading: document.getElementById('loading-state') ? !document.getElementById('loading-state').hidden : false,
          notSignedIn: document.getElementById('not-signed-in') ? !document.getElementById('not-signed-in').hidden : false,
          dashboard: document.getElementById('dashboard-content') ? !document.getElementById('dashboard-content').hidden : false
        }
      };
    });
    
    console.log('[TEST] Dashboard state with existing auth:', JSON.stringify(dashboardState, null, 2));
    
  } else {
    console.log('[TEST] No existing authentication. This would require OAuth flow.');
    
    // Check if clicking sign-in starts the flow
    console.log('[TEST] Testing sign-in flow initiation...');
    const googleButton = await page.locator('button:has-text("Continue with Google")').first();
    
    if (await googleButton.count() > 0) {
      console.log('[TEST] Google sign-in button found, testing click...');
      
      // Set up a promise to wait for navigation to Google
      const navigationPromise = page.waitForURL(/accounts\.google\.com/, { timeout: 10000 });
      
      await googleButton.click();
      
      try {
        await navigationPromise;
        console.log('[TEST] Successfully navigated to Google OAuth');
        console.log('[TEST] Current URL:', await page.url());
        
        // This is where a real user would complete OAuth
        console.log('[TEST] OAuth flow initiated successfully');
        
      } catch (error) {
        console.log('[TEST] Navigation to Google failed or timed out:', error.message);
      }
      
    } else {
      console.log('[TEST] Google sign-in button not found');
    }
  }
  
} catch (error) {
  console.log(`[ERROR] ${error.message}`);
}

console.log('[TEST] Keeping browser open for 20 seconds for inspection...');
await page.waitForTimeout(20000);
await browser.close();
