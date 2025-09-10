import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Testing authentication flow at ${url}`);

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

// Listen for console messages
page.on('console', msg => {
  console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
});

// Listen for page errors
page.on('pageerror', error => {
  console.log(`[PAGE ERROR] ${error.message}`);
});

// Navigate to the page
await page.goto(url);

// Wait for the page to load
await page.waitForTimeout(2000);

// Check if authentication elements are present
const authElements = await page.evaluate(() => {
  const loginBtn = document.getElementById('login-btn');
  const authLoading = document.getElementById('auth-loading');
  const authSignedOut = document.getElementById('auth-signed-out');
  const authSignedIn = document.getElementById('auth-signed-in');
  const status = document.getElementById('status');
  
  return {
    loginBtn: loginBtn ? { exists: true, visible: !loginBtn.hidden, text: loginBtn.textContent } : { exists: false },
    authLoading: authLoading ? { exists: true, hidden: authLoading.hidden } : { exists: false },
    authSignedOut: authSignedOut ? { exists: true, hidden: authSignedOut.hidden } : { exists: false },
    authSignedIn: authSignedIn ? { exists: true, hidden: authSignedIn.hidden } : { exists: false },
    status: status ? { exists: true, text: status.textContent } : { exists: false }
  };
});

console.log('[DEBUG] Auth elements state:', JSON.stringify(authElements, null, 2));

// Wait a bit longer to see if auth state changes
await page.waitForTimeout(3000);

// Check auth state again
const authElementsAfter = await page.evaluate(() => {
  const loginBtn = document.getElementById('login-btn');
  const authLoading = document.getElementById('auth-loading');
  const authSignedOut = document.getElementById('auth-signed-out');
  const authSignedIn = document.getElementById('auth-signed-in');
  const status = document.getElementById('status');
  
  return {
    loginBtn: loginBtn ? { exists: true, visible: !loginBtn.hidden, text: loginBtn.textContent } : { exists: false },
    authLoading: authLoading ? { exists: true, hidden: authLoading.hidden } : { exists: false },
    authSignedOut: authSignedOut ? { exists: true, hidden: authSignedOut.hidden } : { exists: false },
    authSignedIn: authSignedIn ? { exists: true, hidden: authSignedIn.hidden } : { exists: false },
    status: status ? { exists: true, text: status.textContent } : { exists: false }
  };
});

console.log('[DEBUG] Auth elements state after wait:', JSON.stringify(authElementsAfter, null, 2));

await browser.close();
