---
title: 浏览器管理
description: 启动、连接和关闭浏览器，并用 BrowserContext 隔离自动化任务、配置页面权限。
order: 5
category: core-concepts
source: https://pptr.dev/guides/browser-management
summary:
  - launch、connect、close 三种生命周期操作
  - 用 BrowserContext 把自动化任务相互隔离
  - disconnect 只断开连接，不会关掉浏览器
---

## 浏览器管理

用 Puppeteer 干活，第一步通常是 [launch（启动）](https://pptr.dev/api/puppeteer.puppeteernode.launch) 一个浏览器，或者 [connect（连接）](https://pptr.dev/api/puppeteer.puppeteernode.connect) 到一个已有的浏览器。

### 启动浏览器

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();

const page = await browser.newPage();

// ...
```

### 关闭浏览器

要正常关闭浏览器，使用 [`browser.close()`](https://pptr.dev/api/puppeteer.browser.close) 方法：

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();

const page = await browser.newPage();

await browser.close();
```

### 浏览器上下文

如果你需要把各个自动化任务相互隔离，就用 [BrowserContext（浏览器上下文）](https://pptr.dev/api/puppeteer.browser.createbrowsercontext)。不同浏览器上下文之间的 Cookie 和 local storage 并不共享；另外，关闭上下文就能顺带关掉这个上下文里的所有页面。

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();

const context = await browser.createBrowserContext();

const page1 = await context.newPage();
const page2 = await context.newPage();

await context.close();
```

### 权限

你也可以为某个浏览器上下文配置权限：

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const context = browser.defaultBrowserContext();

await context.overridePermissions('https://html5demos.com', ['geolocation']);
```

### 连接正在运行的浏览器

如果浏览器不是在 Puppeteer 里启动的，你可以用 [`connect`](https://pptr.dev/api/puppeteer.puppeteernode.connect) 方法连接它。一般从浏览器打印的输出里就能拿到 WebSocket 端点的 URL：

```ts
const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://127.0.0.1:9222/...',
});

const page = await browser.newPage();

browser.disconnect();
```

> **说明**
>
> 和 `browser.close()` 不同，`browser.disconnect()` 不会关掉浏览器，也不会关闭任何页面。
