const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { launch } = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const TEST_URL = 'http://localhost:3000';
const BROWSERS = ['chrome', 'firefox'];
const VIEWPORTS = [
    { width: 320, height: 568, deviceScaleFactor: 2, isMobile: true }, // iPhone SE
    { width: 375, height: 812, deviceScaleFactor: 3, isMobile: true }, // iPhone X
    { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true }, // iPad
    { width: 1024, height: 768, deviceScaleFactor: 1, isMobile: false }, // Desktop
    { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false }, // Large Desktop
];

async function runLighthouse(url, viewport) {
    const chrome = await launch({ chromeFlags: ['--headless'] });
    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
    };

    const results = await lighthouse(url, options);
    await chrome.kill();

    const reportPath = path.join(__dirname, '../reports', `lighthouse-${viewport.width}x${viewport.height}.html`);
    fs.writeFileSync(reportPath, results.report);

    return results.lhr;
}

async function testViewport(browser, viewport) {
    const page = await browser.newPage();
    await page.setViewport(viewport);

    // Test navigation
    await page.goto(TEST_URL);
    await page.waitForSelector('nav');

    // Test mobile menu
    if (viewport.isMobile) {
        const menuButton = await page.$('button[aria-label="Toggle menu"]');
        if (menuButton) {
            await menuButton.click();
            await page.waitForSelector('.mobile-menu');
        }
    }

    // Test file upload
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
        await fileInput.uploadFile(path.join(__dirname, '../test-files/sample.mp3'));
    }

    // Test RTL support
    await page.evaluate(() => {
        document.documentElement.dir = 'rtl';
    });

    // Take screenshot
    const screenshotPath = path.join(__dirname, '../reports', `screenshot-${viewport.width}x${viewport.height}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await page.close();
}

async function runTests() {
    // Create reports directory
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }

    // Test each browser
    for (const browserType of BROWSERS) {
        const browser = await puppeteer.launch({
            product: browserType,
            headless: true,
        });

        console.log(`Testing ${browserType}...`);

        // Test each viewport
        for (const viewport of VIEWPORTS) {
            console.log(`Testing viewport ${viewport.width}x${viewport.height}...`);
            await testViewport(browser, viewport);

            // Run Lighthouse audit
            const lhr = await runLighthouse(TEST_URL, viewport);
            console.log(`Lighthouse scores for ${viewport.width}x${viewport.height}:`);
            console.log(`Performance: ${lhr.categories.performance.score * 100}`);
            console.log(`Accessibility: ${lhr.categories.accessibility.score * 100}`);
            console.log(`Best Practices: ${lhr.categories['best-practices'].score * 100}`);
            console.log(`SEO: ${lhr.categories.seo.score * 100}`);
        }

        await browser.close();
    }
}

runTests().catch(console.error); 