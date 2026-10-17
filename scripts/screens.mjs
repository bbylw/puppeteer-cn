import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] ?? 'http://localhost:4321/';
const width = Number(process.argv[3] ?? 1440);
const height = Number(process.argv[4] ?? 900);
const prefix = process.argv[5] ?? 'desk';

const dir = new URL('../.frontend-studio/screens/', import.meta.url);
await mkdir(dir, { recursive: true });

const browser = await puppeteer.launch({
  args: ['--ignore-certificate-errors'],
});
const page = await browser.newPage();
await page.setViewport({ width, height });
await page.goto(url, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 900));

const total = await page.evaluate(() => document.body.scrollHeight);
const screens = Math.ceil(total / height);

for (let i = 0; i < screens; i += 1) {
  await page.evaluate((y) => window.scrollTo(0, y), i * height);
  await new Promise((r) => setTimeout(r, 450));
  const file = new URL(`${prefix}-${String(i + 1).padStart(2, '0')}.png`, dir);
  await page.screenshot({ path: file, type: 'png' });
}

console.log(`${screens} screens · ${total}px`);
await browser.close();
