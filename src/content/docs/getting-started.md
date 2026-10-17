---
title: 快速开始
description: 启动或连接一个浏览器、新建页面，然后用 Puppeteer 的 API 操作它们：一个从打开页面到打印标题的完整示例。
order: 3
source: https://pptr.dev/guides/getting-started
summary:
  - 四个动作：launch、newPage、操作、close
  - 一个可直接运行、带中文注释的完整示例
---

如果你用过其他浏览器测试框架，会觉得 Puppeteer 很眼熟。你先 [launch（启动）](https://pptr.dev/api/puppeteer.puppeteernode.launch)/[connect（连接）](https://pptr.dev/api/puppeteer.puppeteernode.connect) 一个 [browser（浏览器）](https://pptr.dev/api/puppeteer.browser)，再 [create（创建）](https://pptr.dev/api/puppeteer.browser.newpage) 一些 [page（页面）](https://pptr.dev/api/puppeteer.page)，然后用 [Puppeteer 的 API](https://pptr.dev/api) 操作它们。

下面的例子在 [developer.chrome.com](https://developer.chrome.com/) 上搜索包含 “automate beyond recorder” 的博客文章，点击第一个结果，并打印这篇博客的完整标题。

```ts
import puppeteer from 'puppeteer';
// 或者：import puppeteer from 'puppeteer-core';

// 启动浏览器并打开一个空白新页面。
const browser = await puppeteer.launch();
const page = await browser.newPage();

// 导航到指定 URL。
await page.goto('https://developer.chrome.com/');

// 设置屏幕尺寸。
await page.setViewport({width: 1080, height: 1024});

// 用键盘打开搜索菜单。
await page.keyboard.press('/');

// 通过无障碍输入名在搜索框中输入内容。
await page.locator('::-p-aria(Search)').fill('automate beyond recorder');

// 等待并点击第一个结果。
await page.locator('.devsite-result-item-link').click();

// 用唯一字符串定位完整标题。
const textSelector = await page
  .locator('::-p-text(Customize and automate)')
  .waitHandle();
const fullTitle = await textSelector?.evaluate(el => el.textContent);

// 打印完整标题。
console.log('The title of this blog post is "%s".', fullTitle);

await browser.close();
```

想了解更深入的用法，请查阅 [文档](https://pptr.dev/docs) 与 [示例](https://github.com/puppeteer/puppeteer/tree/main/examples)。
