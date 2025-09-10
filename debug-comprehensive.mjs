import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Comprehensive authentication debugging at ${url}`);

const browser = await chromium.launch({ 
  headless: false, 
  slowMo: 500
});

const context = await browser.newContext({
  permissions: ['geolocation', 'notifications']
});

const page = await context.newPage();

// Comprehensive logging
page.on('console', msg => {
  console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
});

page.on('pageerror', error => {
  console.log(`[PAGE ERROR] ${error.message}`);
});

page.on('response', response => {
  if (response.url().includes('firebase') || response.url().includes('auth')) {
    console.log(`[NETWORK] ${response.status()} ${response.url()}`);
  }
});

try {
  // Step 1: Go to main page and click login
  console.log('[TEST] Step 1: Going to main page...');
  await page.goto(url);
  await page.waitForTimeout(3000);
  
  // Click the Google sign-in button
  console.log('[TEST] Step 2: Clicking Google sign-in...');
  const googleButton = await page.locator('button:has-text("Continue with Google")').first();
  
  if (await googleButton.count() > 0) {
    await googleButton.click();
    
    // Wait for redirect to Google
    console.log('[TEST] Step 3: Waiting for Google OAuth redirect...');
    await page.waitForTimeout(3000);
    
    const currentUrl = await page.url();
    console.log(`[TEST] Current URL after click: ${currentUrl}`);
    
    if (currentUrl.includes('accounts.google.com')) {
      console.log('[TEST] Step 4: Successfully redirected to Google OAuth');
      
      // Now let's simulate what happens when user comes back
      // Go directly to dashboard to simulate the post-OAuth experience
      console.log('[TEST] Step 5: Simulating return from OAuth by going to dashboard...');
      await page.goto(url + '/dashboard.html');
      
      // Monitor the dashboard loading process in detail
      console.log('[TEST] Step 6: Monitoring dashboard authentication process...');
      
      // Check every 2 seconds for 30 seconds
      for (let i = 0; i < 15; i++) {
        await page.waitForTimeout(2000);
        
        const state = await page.evaluate(() => {
          const result = {
            time: new Date().toISOString(),
            url: window.location.href,
            firebase: {
              authLoaded: typeof auth !== 'undefined',
              currentUser: null,
              isConnected: false
            },
            ui: {
              loading: false,
              notSignedIn: false,
              dashboard: false
            },
            vars: {
              isCheckingAuth: typeof isCheckingAuth !== 'undefined' ? isCheckingAuth : 'undefined',
              authCheckComplete: typeof authCheckComplete !== 'undefined' ? authCheckComplete : 'undefined'
            }
          };
          
          // Check Firebase
          if (typeof auth !== 'undefined') {
            try {
              result.firebase.currentUser = auth.currentUser ? {
                email: auth.currentUser.email,
                uid: auth.currentUser.uid
              } : null;
              result.firebase.isConnected = true;
            } catch (e) {
              result.firebase.error = e.message;
            }
          }
          
          // Check UI elements
          const loading = document.getElementById('loading-state');
          const notSignedIn = document.getElementById('not-signed-in');
          const dashboard = document.getElementById('dashboard-content');
          
          result.ui.loading = loading ? !loading.hidden : false;
          result.ui.notSignedIn = notSignedIn ? !notSignedIn.hidden : false;
          result.ui.dashboard = dashboard ? !dashboard.hidden : false;
          
          return result;
        });
        
        console.log(`[TEST] Check ${i + 1}/15:`, JSON.stringify(state, null, 2));
        
        // If we see the final state (either dashboard or not signed in), break
        if (state.ui.dashboard || state.ui.notSignedIn) {
          console.log(`[TEST] Final state reached after ${(i + 1) * 2} seconds`);
          break;
        }
      }
      
    } else {
      console.log('[TEST] Step 4: Did not redirect to Google OAuth, checking current state...');
      
      // Check if we're already signed in
      const authState = await page.evaluate(() => {
        return {
          currentUser: typeof auth !== 'undefined' && auth.currentUser ? auth.currentUser.email : null,
          currentUrl: window.location.href
        };
      });
      
      console.log('[TEST] Current auth state:', JSON.stringify(authState, null, 2));
    }
    
  } else {
    console.log('[TEST] Google sign-in button not found!');
  }
  
} catch (error) {
  console.log(`[ERROR] ${error.message}`);
}

console.log('[TEST] Keeping browser open for 30 seconds for manual inspection...');
await page.waitForTimeout(30000);
await browser.close();
