import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Live site testing - checking actual behavior`);

const browser = await chromium.launch({ 
  headless: false, 
  slowMo: 2000
});

const context = await browser.newContext();
const page = await context.newPage();

// Listen for all events
page.on('console', msg => {
  console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
});

page.on('response', response => {
  if (response.url().includes('.js') || response.url().includes('.css')) {
    console.log(`[NETWORK] ${response.status()} ${response.url()}`);
  }
});

try {
  console.log('[TEST] 1. Going to main page and waiting...');
  await page.goto(url);
  
  // Wait longer to see what actually happens
  await page.waitForTimeout(8000);
  
  // Get detailed state
  const mainPageState = await page.evaluate(() => {
    const result = {
      title: document.title,
      url: window.location.href,
      visibleElements: {},
      authElements: {}
    };
    
    // Check what's actually visible
    const elements = [
      'auth-loading',
      'auth-signed-out', 
      'auth-signed-in',
      'signed-out',
      'signed-in',
      'loading'
    ];
    
    elements.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        result.authElements[id] = {
          exists: true,
          hidden: el.hidden,
          display: window.getComputedStyle(el).display,
          visibility: window.getComputedStyle(el).visibility
        };
      } else {
        result.authElements[id] = { exists: false };
      }
    });
    
    // Check for any loading text
    const loadingElements = document.querySelectorAll('*');
    const loadingTexts = [];
    loadingElements.forEach(el => {
      const text = el.textContent || '';
      if (text.toLowerCase().includes('checking') || text.toLowerCase().includes('authentication')) {
        loadingTexts.push({
          tag: el.tagName,
          text: text.trim(),
          visible: window.getComputedStyle(el).display !== 'none' && !el.hidden
        });
      }
    });
    result.loadingTexts = loadingTexts;
    
    return result;
  });
  
  console.log('[TEST] Main page state:', JSON.stringify(mainPageState, null, 2));
  
  // Now test dashboard directly
  console.log('[TEST] 2. Going to dashboard...');
  await page.goto(url + '/dashboard.html');
  await page.waitForTimeout(10000);
  
  const dashboardState = await page.evaluate(() => {
    const result = {
      title: document.title,
      url: window.location.href,
      visibleStates: {}
    };
    
    // Check dashboard states
    const states = ['loading-state', 'not-signed-in', 'dashboard-content'];
    states.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        result.visibleStates[id] = {
          exists: true,
          hidden: el.hidden,
          display: window.getComputedStyle(el).display,
          visible: window.getComputedStyle(el).display !== 'none' && !el.hidden
        };
      } else {
        result.visibleStates[id] = { exists: false };
      }
    });
    
    // Count how many states are visible
    const visibleCount = Object.values(result.visibleStates).filter(state => state.visible).length;
    result.visibleStateCount = visibleCount;
    
    return result;
  });
  
  console.log('[TEST] Dashboard state:', JSON.stringify(dashboardState, null, 2));
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  console.log('[TEST] Screenshot saved as debug-screenshot.png');
  
} catch (error) {
  console.log(`[ERROR] ${error.message}`);
}

console.log('[TEST] Keeping browser open for manual inspection...');
await page.waitForTimeout(30000);
await browser.close();
