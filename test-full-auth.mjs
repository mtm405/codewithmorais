import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Testing complete authentication flow at ${url}`);

const browser = await chromium.launch({ 
  headless: false, 
  slowMo: 1500
});

const context = await browser.newContext({
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
  console.log('[DEBUG] Step 1: Going to login page...');
  await page.goto(url);
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  console.log('[DEBUG] Step 2: Looking for Google sign-in button...');
  const googleButton = await page.locator('button:has-text("Continue with Google")').first();
  
  if (await googleButton.count() > 0) {
    console.log('[DEBUG] Step 3: Clicking Google sign-in button...');
    await googleButton.click();
    
    // Wait for potential redirect or popup
    await page.waitForTimeout(5000);
    
    console.log('[DEBUG] Step 4: Current URL after click:', await page.url());
    
    // Check if we're still on the same domain or redirected somewhere
    const currentUrl = await page.url();
    if (currentUrl.includes('accounts.google.com')) {
      console.log('[DEBUG] Step 5: Redirected to Google OAuth...');
      // We would normally complete OAuth here, but for testing we'll just observe
      
      // Let's see what happens if we go back to dashboard directly
      console.log('[DEBUG] Step 6: Simulating OAuth completion by going to dashboard...');
      await page.goto(url + '/dashboard.html');
      await page.waitForTimeout(5000);
      
      console.log('[DEBUG] Step 7: Dashboard state after simulated OAuth:', await page.url());
    } else if (currentUrl.includes(url)) {
      console.log('[DEBUG] Step 5: Still on our domain, checking auth state...');
      await page.waitForTimeout(5000);
      
      // Check if dashboard link is available
      const dashboardLink = await page.locator('a[href*="dashboard"], a[href="/dashboard.html"]').first();
      if (await dashboardLink.count() > 0) {
        console.log('[DEBUG] Step 6: Clicking dashboard link...');
        await dashboardLink.click();
        await page.waitForTimeout(5000);
      } else {
        console.log('[DEBUG] Step 6: No dashboard link found, going directly...');
        await page.goto(url + '/dashboard.html');
        await page.waitForTimeout(5000);
      }
    }
  } else {
    console.log('[DEBUG] No Google sign-in button found on page');
    
    // Check what elements are available
    const buttons = await page.locator('button').all();
    console.log(`[DEBUG] Found ${buttons.length} buttons on page`);
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const text = await buttons[i].textContent();
      console.log(`[DEBUG] Button ${i + 1}: "${text}"`);
    }
  }
  
  // Get final state
  const finalUrl = await page.url();
  const finalState = await page.evaluate(() => {
    const result = {
      title: document.title,
      url: window.location.href,
      isAuthHandler: window.location.href.includes('__/auth/handler'),
      isDashboard: window.location.href.includes('dashboard'),
      hasAuthElements: {
        loadingState: !!document.getElementById('loading-state'),
        notSignedIn: !!document.getElementById('not-signed-in'),
        dashboardContent: !!document.getElementById('dashboard-content')
      }
    };
    
    if (result.hasAuthElements.loadingState) {
      result.loadingVisible = !document.getElementById('loading-state').hidden;
    }
    if (result.hasAuthElements.notSignedIn) {
      result.notSignedInVisible = !document.getElementById('not-signed-in').hidden;
    }
    if (result.hasAuthElements.dashboardContent) {
      result.dashboardVisible = !document.getElementById('dashboard-content').hidden;
    }
    
    return result;
  });
  
  console.log('[DEBUG] Final state:', JSON.stringify(finalState, null, 2));
  
} catch (error) {
  console.log(`[ERROR] ${error.message}`);
}

// Keep browser open for manual inspection
console.log('[DEBUG] Browser will close in 15 seconds...');
await page.waitForTimeout(15000);
await browser.close();
