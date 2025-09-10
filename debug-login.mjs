import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Testing login button click at ${url}`);

const browser = await chromium.launch({ headless: false, slowMo: 1000 });
const page = await browser.newPage();

// Listen for console messages
page.on('console', msg => {
  console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
});

// Listen for page errors
page.on('pageerror', error => {
  console.log(`[PAGE ERROR] ${error.message}`);
});

// Listen for network requests
page.on('request', request => {
  if (request.url().includes('google') || request.url().includes('firebase') || request.url().includes('auth')) {
    console.log(`[NETWORK] ${request.method()} ${request.url()}`);
  }
});

// Navigate to the page
await page.goto(url);

// Wait for the page to load
await page.waitForTimeout(3000);

console.log('[DEBUG] Page loaded, looking for login button...');

// Click the login button
try {
  await page.click('#login-btn');
  console.log('[DEBUG] Login button clicked');
  
  // Wait for potential redirect or popup
  await page.waitForTimeout(5000);
  
  console.log(`[DEBUG] Current URL after click: ${page.url()}`);
  
} catch (error) {
  console.log(`[ERROR] Failed to click login button: ${error.message}`);
}

await browser.close();
