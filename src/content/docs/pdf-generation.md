---
title: PDF 生成
description: 用 Page.pdf() 把页面打印成 PDF，默认会等待字体加载完成。
order: 14
category: guides
source: https://pptr.dev/guides/pdf-generation
summary:
  - 打印 PDF 用 Page.pdf()
  - 通过 path 选项指定保存位置
  - Page.pdf() 默认会等字体加载完毕
---

打印 PDF 请使用 [`Page.pdf()`](https://pptr.dev/api/puppeteer.page.pdf)。

```ts
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://news.ycombinator.com', {
  waitUntil: 'networkidle2',
});
// 把 PDF 保存到 hn.pdf。
await page.pdf({
  path: 'hn.pdf',
});

await browser.close();
```

默认情况下，[`Page.pdf()`](https://pptr.dev/api/puppeteer.page.pdf) 会等待字体加载完成。
