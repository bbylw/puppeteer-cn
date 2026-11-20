---
title: 执行 JavaScript
description: 用 evaluate 在页面上下文里执行 JavaScript，理解函数如何被序列化、返回值怎么处理、Promise 怎么等待、参数怎么传。
order: 7
category: core-concepts
source: https://pptr.dev/guides/javascript-execution
summary:
  - evaluate 的函数会被转成字符串送到页面里执行
  - 返回对象走 JSON 序列化，DOM 节点要用 evaluateHandle
  - 返回的 Promise 会被自动 await，参数可以是 JSHandle
---

## 执行 JavaScript

Puppeteer 允许你在它所驱动的页面上下文里执行 JavaScript 函数：

```ts
// 引入 puppeteer
import puppeteer from 'puppeteer';

// 启动浏览器
const browser = await puppeteer.launch();

// 新建一个页面
const page = await browser.newPage();

// 打开你的站点
await page.goto('YOUR_SITE');

// 执行 JavaScript
const three = await page.evaluate(() => {
  return 1 + 2;
});

console.log(three);

// 关闭浏览器。
await browser.close();
```

> **注意**
>
> 虽然函数是定义在你自己脚本的上下文里的，但 Puppeteer 实际上会把它转成字符串，发送到目标页面并在那里执行。这意味着该函数访问不到你作用域里的变量，也调用不了 Puppeteer 脚本里定义的其他函数，整个函数逻辑都得写在函数体里面。

另外，你也可以把函数体直接写成一个字符串传进去：

```ts
// 执行 JavaScript
const three = await page.evaluate(`
    1 + 2
`);
```

> **注意**
>
> 上面的例子得到的是同样的结果，但它也说明了另一件事：被执行的函数能用哪些类型和全局变量，Puppeteer 是无从得知的。尤其是在 TypeScript 里，你要自己确认被求值函数引用到的那些对象是对的。

### 返回类型

你执行的函数可以有返回值。如果返回值是基础类型，Puppeteer 会自动把它转换成脚本上下文里的基础类型，就像前面那个例子一样。

如果脚本返回的是一个对象，Puppeteer 会把它序列化成 JSON，再在脚本这一侧重建出来。这个过程不一定总能得到正确的结果，比如你返回的是一个 DOM 节点时：

```ts
const body = await page.evaluate(() => {
  return document.body;
});
console.log(body); // {}，意外吧！
```

为了处理这类返回的对象，Puppeteer 提供了按引用返回对象的方式：

```ts
const body = await page.evaluateHandle(() => {
  return document.body;
});
console.log(body instanceof ElementHandle); // true
```

返回的对象要么是一个 `JSHandle`，要么是一个 `ElementHandle`。`ElementHandle` 继承自 `JSHandle`，只有 DOM 元素才会创建它。

句柄上具体有哪些方法可用，可以查看 [API 文档](https://pptr.dev/api) 了解更多细节。

### 返回 Promise

如果你在 evaluate 调用里返回一个 Promise，这个 Promise 会被自动 await。举个例子：

```ts
await page.evaluate(() => {
  // 等待 100ms。
  return new Promise(resolve => setTimeout(resolve, 100));
});
// 页面上下文里创建的那个 Promise resolve 之后，执行才会继续走到这里。
```

### 给 evaluate 函数传参

你可以给自己的函数传入参数：

```ts
const three = await page.evaluate(
  (a, b) => {
    return a + b; // 1 + 2
  },
  1,
  2,
);
```

参数可以是基础类型的值，也可以是 `JSHandle`。

> **说明**
>
> Page、JSHandle 和 ElementHandle 提供了不少用来执行 JavaScript 的辅助方法，但它们全都遵循本指南里讲的这些基本原则。
