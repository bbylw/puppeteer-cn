---
title: 管理 Cookie
description: 用 Browser 与 BrowserContext 上的方法直接读写和删除浏览器存储里的 Cookie，方便在测试中保存和恢复特定 Cookie。
order: 16
category: guides
source: https://pptr.dev/guides/cookies
summary:
  - 读取默认 BrowserContext 中可用的 Cookie
  - 直接把 Cookie 写进浏览器存储
  - 从存储里删除指定的 Cookie
---

Puppeteer 提供了一些方法，可以直接操作浏览器存储，提前获取、设置和删除 Cookie。如果你需要为测试保存和恢复特定的 Cookie，这会很有用。

### 获取 Cookie

下面的例子演示了如何获取浏览器默认 [BrowserContext](https://pptr.dev/api/puppeteer.browsercontext) 中可用的 Cookie。

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();

const page = await browser.newPage();

await page.goto('https://example.com');

// 在这个例子里，我们用脚本执行来设置一个 Cookie。
// Cookie 可以由页面或服务端以多种方式设置。
await page.evaluate(() => {
  document.cookie = 'myCookie = MyCookieValue';
});

console.log(await browser.cookies()); // 打印当前可用的 Cookie。
```

### 设置 Cookie

Puppeteer 也能直接把 Cookie 写入浏览器存储：

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();

// 为 localhost 域名设置两个 Cookie。
await browser.setCookie(
  {
    name: 'cookie1',
    value: '1',
    domain: 'localhost',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: false,
    sourceScheme: 'NonSecure',
  },
  {
    name: 'cookie2',
    value: '2',
    domain: 'localhost',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: false,
    sourceScheme: 'NonSecure',
  },
);

console.log(await browser.cookies()); // 打印当前可用的 Cookie。
```

### 删除 Cookie

[`Browser.deleteCookie()`](https://pptr.dev/api/puppeteer.browser.deletecookie) 方法可以从存储中删除 Cookie。

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();

// 删除 localhost 域名下的两个 Cookie。
await browser.deleteCookie(
  {
    name: 'cookie1',
    value: '1',
    domain: 'localhost',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: false,
    sourceScheme: 'NonSecure',
  },
  {
    name: 'cookie2',
    value: '2',
    domain: 'localhost',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: false,
    sourceScheme: 'NonSecure',
  },
);

console.log(await browser.cookies()); // 打印当前可用的 Cookie。
```

除了作用在默认浏览器上下文上的 `Browser` 方法，[`BrowserContext`](https://pptr.dev/api/puppeteer.browsercontext) 类上也能用到同样的方法。
