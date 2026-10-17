import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const outDir = new URL('../src/assets/shots/', import.meta.url);
const out = (name) => fileURLToPath(new URL(name, outDir));
await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  args: ['--ignore-certificate-errors'],
});

async function open(url, viewport, lang = 'en-US') {
  const page = await browser.newPage();
  await page.setViewport({ deviceScaleFactor: 2, ...viewport });
  await page.setExtraHTTPHeaders({ 'Accept-Language': `${lang},en;q=0.9` });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1000));
  return page;
}

async function dismissCookies(page) {
  await page.evaluate(() => {
    const labels = ['okay, got it!', 'got it', 'accept all', 'accept'];
    const nodes = Array.from(document.querySelectorAll('button, a'));
    const target = nodes.find((n) =>
      labels.includes((n.textContent || '').trim().toLowerCase())
    );
    if (target) target.click();
  });
  await new Promise((r) => setTimeout(r, 600));
}

async function clipAround(page, selector, pad, fileName) {
  const el = await page.$(selector);
  if (!el) {
    console.warn('missing selector', selector);
    return false;
  }
  const box = await el.boundingBox();
  if (!box) return false;
  const vp = page.viewport();
  const x = Math.max(0, box.x - pad.x);
  const y = Math.max(0, box.y - pad.y);
  const width = Math.min(vp.width - x, box.width + pad.x * 2, 1080);
  const height = Math.round(width / 1.8);
  await page.screenshot({
    path: out(fileName),
    clip: { x, y, width, height },
  });
  return true;
}

// 1. Chrome for Developers — the big hero headline
{
  const page = await open('https://developer.chrome.com/?hl=en', {
    width: 1440,
    height: 900,
  });
  await page.screenshot({
    path: out('chrome-hero.png'),
    clip: { x: 150, y: 40, width: 1080, height: 600 },
  });
  await page.close();
}

// 2. pptr.dev — the installation code block
{
  const page = await open('https://pptr.dev/guides/installation', {
    width: 1440,
    height: 1100,
  });
  await dismissCookies(page);
  const ok = await clipAround(page, 'pre', { x: 30, y: 30 }, 'pptr-code.png');
  if (!ok) {
    await page.screenshot({ path: out('pptr-code.png') });
  }
  await page.close();
}

// 3. pptr.dev mobile — navigation and title
{
  const page = await open(
    'https://pptr.dev/guides/getting-started',
    { width: 390, height: 844, isMobile: true },
    'zh-CN'
  );
  await dismissCookies(page);
  await page.screenshot({ path: out('pptr-mobile.png') });
  await page.screenshot({
    path: out('pptr-mobile-top.png'),
    clip: { x: 0, y: 0, width: 390, height: 219 },
  });
  await page.close();
}

// 4. pptr.dev — the page title and opening paragraph
{
  const page = await open('https://pptr.dev/guides/what-is-puppeteer', {
    width: 1440,
    height: 900,
  });
  await dismissCookies(page);
  await page.screenshot({
    path: out('pptr-docs.png'),
    clip: { x: 330, y: 96, width: 900, height: 500 },
  });
  await page.close();
}

// 5. pptr.dev home — full first screen for the close tile
{
  const page = await open('https://pptr.dev/', { width: 1440, height: 900 });
  await dismissCookies(page);
  await page.screenshot({ path: out('pptr-home.png') });
  await page.close();
}

await browser.close();
console.log('done');
