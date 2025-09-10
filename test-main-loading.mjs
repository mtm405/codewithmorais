import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Testing main page authentication loading issue`);

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
  console.log('[TEST] Loading main page...');
  await page.goto(url);
  
  // Check the UI state every second for 15 seconds
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    
    const state = await page.evaluate((second) => {
      const result = {
        time: second,
        ui: {
          loading: false,
          signedOut: false,
          signedIn: false
        },
        loadingText: ''
      };
      
      // Check UI states
      const loading = document.getElementById('auth-loading');
      const signedOut = document.getElementById('auth-signed-out');
      const signedIn = document.getElementById('auth-signed-in');
      
      result.ui.loading = loading ? !loading.hidden : false;
      result.ui.signedOut = signedOut ? !signedOut.hidden : false;
      result.ui.signedIn = signedIn ? !signedIn.hidden : false;
      
      // Get loading text if visible
      if (result.ui.loading && loading) {
        const loadingContent = loading.querySelector('.loading-content p');
        result.loadingText = loadingContent ? loadingContent.textContent : '';
      }
      
      return result;
    }, i + 1);
    
    console.log(`[TEST] Second ${state.time}:`, JSON.stringify(state, null, 2));
    
    // If we see a stable state (not loading), break
    if (!state.ui.loading && (state.ui.signedOut || state.ui.signedIn)) {
      console.log(`[TEST] Stable state reached at ${state.time} seconds`);
      break;
    }
  }
  
} catch (error) {
  console.log(`[ERROR] ${error.message}`);
}

console.log('[TEST] Keeping browser open for 10 seconds...');
await page.waitForTimeout(10000);
await browser.close();
