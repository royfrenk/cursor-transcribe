const { test } = require('@playwright/test');

test('print homepage DOM', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const html = await page.content();
  console.log(html);
}); 