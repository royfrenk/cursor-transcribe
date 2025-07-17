const { test, expect } = require('@playwright/test');

test.describe('Page State', () => {
  test('should have the correct title and log console output', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto('http://localhost:3000');
    const title = await page.title();
    console.log('Page title:', title);
    console.log('Page URL:', page.url());

    // Example assertion: title contains something
    expect(title).not.toBe('');

    // Wait a bit to collect logs
    await page.waitForTimeout(1000);
    console.log('Console logs:', logs);
  });
}); 