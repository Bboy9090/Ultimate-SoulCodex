import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium'
});
const page = await browser.newPage();
page.setViewportSize({ width: 1280, height: 720 });

console.log('Opening app...');
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/app-home.png' });

const initialContent = await page.evaluate(() => {
  return document.body.innerText.substring(0, 500);
});
console.log('Initial page content:\n', initialContent);

console.log('\nNavigating to /timeline...');
await page.goto('http://localhost:3000/timeline', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const timelineContent = await page.evaluate(() => {
  return {
    heading: document.querySelector('h1')?.textContent,
    allText: document.body.innerText
  };
});

console.log('Timeline heading:', timelineContent.heading);
console.log('Timeline page text (first 600 chars):\n', timelineContent.allText.substring(0, 600));
await page.screenshot({ path: '/tmp/app-timeline.png', fullPage: true });

await browser.close();
console.log('\nScreenshots saved to /tmp/');
