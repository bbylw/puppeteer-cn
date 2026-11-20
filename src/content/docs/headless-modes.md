---
title: 无头模式
description: Puppeteer 默认以无头模式启动浏览器，可在新版无头模式、chrome-headless-shell 和有头模式之间按需切换。
order: 12
category: guides
source: https://pptr.dev/guides/headless-modes
summary:
  - 默认就是无头模式，等价于显式传入 `headless` 为 true
  - 旧版无头模式已独立成 chrome-headless-shell，性能更好但特性不全
  - 想看界面时把 `headless` 设为 false
---

默认情况下，Puppeteer 以[无头模式](https://developer.chrome.com/docs/automation-and-testing/headless)启动浏览器。

```ts
const browser = await puppeteer.launch();
// 等价于
const browser = await puppeteer.launch({headless: true});
```

在 v22 之前，Puppeteer 默认启动的是[旧版无头模式](https://developer.chrome.com/docs/automation-and-testing/headless)。旧版无头模式现在叫作 [`chrome-headless-shell`](https://developer.chrome.com/docs/automation-and-testing/headless-chrome-shell)，作为一个独立的二进制发布。`chrome-headless-shell` 的行为与完整的 Chrome 并不完全一致，但在用不到 Chrome 全部特性的自动化任务里，目前它的性能更好。如果你的场景更看重性能，可以按下面的方式切换到 `chrome-headless-shell`：

```ts
const browser = await puppeteer.launch({headless: 'shell'});
```

要启动“有头”版本的 Chrome，在启动浏览器时把 [`headless`](https://pptr.dev/api/puppeteer.launchoptions) 设为 `false`：

```ts
const browser = await puppeteer.launch({headless: false});
```
