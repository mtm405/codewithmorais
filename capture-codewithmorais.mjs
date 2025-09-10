import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('[PAGE LOG]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));
  page.on('request', req => {
    const url = req.url();
    if (url.includes('accounts.google.com')) console.log('[REQ]', req.method(), url);
  });
  page.on('response', resp => {
    const url = resp.url();
    if (url.includes('accounts.google.com')) console.log('[RESP]', resp.status(), url);
    if (resp.status() >= 400) console.log('[RESP ERR]', resp.status(), url);
  });

  console.log('Opening custom domain...');
  await page.goto('https://codewithmorais.com', { waitUntil: 'networkidle' });
  console.log('Page loaded. Clicking login...');

  try {
    await page.click('#login-btn', { timeout: 5000 });
    console.log('Clicked login. Waiting...');
  } catch (e) {
    console.log('Click failed:', e.message);
  }

  // Wait longer to capture redirects/popups and allow persistence to be written
  await page.waitForTimeout(20000);

  // Inspect cookies, localStorage, sessionStorage and IndexedDB for firebase auth state
  const cookies = await context.cookies();
  console.log('[STORAGE] cookies:', cookies.filter(c => c.name.toLowerCase().includes('firebase') || c.name.toLowerCase().includes('auth') || c.name.toLowerCase().includes('session')).map(c => ({ name: c.name, domain: c.domain })));

  const localStorageData = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.toLowerCase().includes('firebase') || k.toLowerCase().includes('auth'));
    const result = {};
    keys.forEach(k => result[k] = localStorage.getItem(k));
    return result;
  });
  console.log('[STORAGE] localStorage keys:', Object.keys(localStorageData));

  const sessionStorageData = await page.evaluate(() => {
    const keys = Object.keys(sessionStorage).filter(k => k.toLowerCase().includes('firebase') || k.toLowerCase().includes('auth'));
    const result = {};
    keys.forEach(k => result[k] = sessionStorage.getItem(k));
    return result;
  });
  console.log('[STORAGE] sessionStorage keys:', Object.keys(sessionStorageData));

  // IndexedDB check: list databases and look for firebase-related stores
  const idbInfo = await page.evaluate(async () => {
    if (!('indexedDB' in window)) return { supported: false };
    const dbs = [];
    try {
      // Some browsers support indexedDB.databases()
      if (indexedDB.databases) {
        const infos = await indexedDB.databases();
        for (const i of infos) dbs.push(i.name);
      } else {
        // Fallback: try known firebase DB names
        dbs.push('firebaseLocalStorageDb (unknown)');
      }
    } catch (err) {
      dbs.push('error: ' + err.message);
    }
    return { supported: true, dbs };
  });
  console.log('[STORAGE] indexedDB:', idbInfo);

  // If firebaseLocalStorageDb exists, try to read the firebaseLocalStorage object store
  if (idbInfo && Array.isArray(idbInfo.dbs) && idbInfo.dbs.includes('firebaseLocalStorageDb')) {
    const idbEntries = await page.evaluate(async () => {
      const dbName = 'firebaseLocalStorageDb';
      return new Promise((resolve) => {
        try {
          const req = indexedDB.open(dbName);
          req.onsuccess = function() {
            const db = req.result;
            if (!db.objectStoreNames.contains('firebaseLocalStorage')) {
              resolve({ error: 'store-missing' });
              return;
            }
            const tx = db.transaction('firebaseLocalStorage', 'readonly');
            const store = tx.objectStore('firebaseLocalStorage');
            const allReq = store.getAll();
            allReq.onsuccess = function() { resolve({ entries: allReq.result }); };
            allReq.onerror = function(e) { resolve({ error: e.message }); };
          };
          req.onerror = function(e) { resolve({ error: e.message }); };
        } catch (err) {
          resolve({ error: err.message });
        }
      });
    });
    console.log('[STORAGE] idbEntries:', idbEntries);
  } else {
    console.log('[STORAGE] firebaseLocalStorageDb not present');
  }

  console.log('Done capturing. Closing.');
  await browser.close();
})();
