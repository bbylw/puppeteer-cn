---
title: 什么是 Puppeteer？
description: Puppeteer 是一个 JavaScript 库，提供高级 API，通过 DevTools Protocol 或 WebDriver BiDi 控制 Chrome 或 Firefox，默认以无头模式运行。
order: 1
source: https://pptr.dev/guides/what-is-puppeteer
summary:
  - 一句话定义：用高级 API 控制真实浏览器
  - 六类典型用途，从表单自动化到预渲染
---

Puppeteer 是一个 JavaScript 库，提供高级 API，用于通过 [DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) 或 [WebDriver BiDi](https://pptr.dev/webdriver-bidi) 控制 Chrome 或 Firefox。Puppeteer 默认以无头（没有可见界面）模式运行，也可以配置为可见的（“有头”）浏览器。

## 功能

大部分你能在浏览器里手动完成的事情，都可以用 Puppeteer 完成。下面是几个上手就能用的例子：

- 自动化表单提交、UI 测试、键盘输入等操作。
- 使用最新的 JavaScript 与浏览器特性，搭建自动化测试环境。
- 捕获站点的 [timeline trace](https://developer.chrome.com/docs/devtools/performance/reference)，用来定位性能问题。
- [测试 Chrome 扩展](https://pptr.dev/guides/chrome-extensions)。
- 生成页面的截图与 PDF。
- 抓取单页应用（SPA）并生成预渲染内容，也就是通常所说的“SSR”（服务端渲染）。
