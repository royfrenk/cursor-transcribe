const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Hook into page console logs
  page.on('console', msg => {
    console.log('[PAGE LOG]', msg.text());
  });

  await page.goto('http://localhost:3000');

  setInterval(async () => {
    const title = await page.title();
    const url = page.url();
    console.log({ title, url });
  }, 1000);

  // Keep the script running
})(); 