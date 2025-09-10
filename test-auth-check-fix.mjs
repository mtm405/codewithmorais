import { chromium } from 'playwright';

const url = 'https://codewithmorais.com';

console.log(`[DEBUG] Quick test of main page loading fix`);

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
  
  // Wait for page to settle
  await page.waitForTimeout(3000);
  
  // Check for the "Checking your authentication..." text visibility
  const authCheckText = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const results = [];
    
    elements.forEach(el => {
      const text = el.textContent || '';
      if (text.includes('Checking your authentication')) {
        const styles = window.getComputedStyle(el);
        results.push({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          text: text.trim(),
          display: styles.display,
          visibility: styles.visibility,
          hidden: el.hidden,
          isVisible: styles.display !== 'none' && !el.hidden && styles.visibility !== 'hidden'
        });
      }
    });
    
    return results;
  });
  
  console.log('[TEST] Elements with "Checking your authentication" text:', JSON.stringify(authCheckText, null, 2));
  
  // Check if Google sign-in button is visible
  const googleButton = await page.locator('button:has-text("Continue with Google")');
  const buttonVisible = await googleButton.count() > 0;
  
  console.log('[TEST] Google sign-in button visible:', buttonVisible);
  
  // Overall assessment
  const hasVisibleAuthCheck = authCheckText.some(el => el.isVisible);
  console.log('[TEST] RESULT: "Checking your authentication" visible:', hasVisibleAuthCheck);
  console.log('[TEST] RESULT: This should be FALSE for the fix to be working');
  
} catch (error) {
  console.log(`[ERROR] ${error.message}`);
}

console.log('[TEST] Test complete, closing browser...');
await browser.close();
