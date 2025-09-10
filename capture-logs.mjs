import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('[PAGE LOG]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));
  page.on('requestfailed', req => console.log('[REQ FAILED]', req.url(), req.failure() && req.failure().errorText));
  page.on('response', resp => {
    if (resp.status() >= 400) console.log('[RESP]', resp.status(), resp.url());
  });

  console.log('Opening site...');
  await page.goto('https://code-with-morais-405.web.app', { waitUntil: 'networkidle' });
  console.log('Page loaded. Trying to click login button...');

  try {
    await page.click('#login-btn', { timeout: 5000 });
    console.log('Clicked login button. Waiting for events...');
  } catch (e) {
    console.log('Click failed:', e.message);
  }

  // Wait to capture popups and console errors
  await page.waitForTimeout(7000);

  console.log('Done capturing. Closing browser.');
  await browser.close();
})();
