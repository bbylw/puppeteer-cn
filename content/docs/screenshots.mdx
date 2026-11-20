---
title: 截图
description: 用 Page.screenshot() 捕获整页截图，用 ElementHandle.screenshot() 捕获单个元素的截图。
order: 13
category: guides
source: https://pptr.dev/guides/screenshots
summary:
  - 整页截图用 Page.screenshot()
  - 元素截图用 ElementHandle.screenshot()，它会自动把元素滚入视口
---

捕获截图请使用 [`Page.screenshot()`](https://pptr.dev/api/puppeteer.page.screenshot)。

```ts
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://news.ycombinator.com', {
  waitUntil: 'networkidle2',
});
await page.screenshot({
  path: 'hn.png',
});

await browser.close();
```

你也可以用 [`ElementHandle.screenshot()`](https://pptr.dev/api/puppeteer.elementhandle.screenshot) 捕获某个特定元素的截图：

```ts
const fileElement = await page.waitForSelector('div');
await fileElement.screenshot({
  path: 'div.png',
});
```

默认情况下，如果元素当前不可见，[`ElementHandle.screenshot()`](https://pptr.dev/api/puppeteer.elementhandle.screenshot) 会尝试把它滚动到视图内。
