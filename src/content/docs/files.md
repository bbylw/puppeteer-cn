---
title: 文件上传与下载
description: Puppeteer 目前不提供以编程方式处理文件下载的能力；上传文件需要定位到文件输入元素，再调用 ElementHandle.uploadFile。
order: 17
category: guides
source: https://pptr.dev/guides/files
summary:
  - 文件下载暂时没有编程接口
  - 文件上传走 ElementHandle.uploadFile
---

目前 Puppeteer 没有提供以编程方式处理文件下载的方法。如果要上传文件，你需要先定位到文件输入元素，再调用 [`ElementHandle.uploadFile`](https://pptr.dev/api/puppeteer.elementhandle.uploadfile)。

```ts
const fileElement = await page.waitForSelector('input[type=file]');
await fileElement.uploadFile(['./path-to-local-file']);
```
