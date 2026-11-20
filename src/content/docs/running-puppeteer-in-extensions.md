---
title: 在 Chrome 扩展里运行 Puppeteer
description: 在 Chrome 扩展中通过 chrome.debugger 使用 Puppeteer：需要专用 transport，视图限制在单个页面，新标签页要用 chrome.tabs 创建。
order: 19
category: guides
source: https://pptr.dev/guides/running-puppeteer-in-extensions
summary:
  - chrome.debugger 只提供受限的 CDP 访问，一次只能附加一个页面
  - 用 ExtensionTransport.connectTab 建立连接
  - 用打包工具构建扩展，rollup 配置示例
---

> **注意**
>
> Chrome 扩展环境和常见的 Node.js 环境差别很大，因此在 `chrome.debugger` 里运行 Puppeteer 目前还是实验性功能。如果你遇到 bug，请到 https://github.com/puppeteer/puppeteer/issues/new/choose 提交 issue。

Chrome 扩展可以通过 [`chrome.debugger`](https://developer.chrome.com/docs/extensions/reference/api/debugger) 访问 Chrome DevTools Protocol。但 [`chrome.debugger`](https://developer.chrome.com/docs/extensions/reference/api/debugger) 对 CDP 的访问是受限的，而且一次只允许附加一个页面。因此 Puppeteer 需要使用不同的 transport，并且它能看到的范围也被限制在单个页面内。也就是说，你可以和这一个页面以及它的 frame、worker 交互，但不能用 Puppeteer 新建页面。要创建新页面，你需要使用 [`chrome.tabs`](https://developer.chrome.com/docs/extensions/reference/api/tabs) API，然后再建立一条新的 Puppeteer 连接。

### 如何在 Chrome 扩展里运行 Puppeteer

> **说明**
>
> 完整示例见 https://github.com/puppeteer/puppeteer/tree/main/examples/puppeteer-in-extension 。

要在扩展里运行 Puppeteer，首先需要用 rollup 或 webpack 这类打包工具产出浏览器可用的构建：

1. 导入 Puppeteer 时，使用 puppeteer-core 提供的浏览器专用入口 `puppeteer-core/lib/puppeteer/puppeteer-core-browser.js`：

```ts
import {
  connect,
  ExtensionTransport,
} from 'puppeteer-core/lib/puppeteer/puppeteer-core-browser.js';

// 新建一个标签页，或者找到一个要附加到的标签页。
const tab = await chrome.tabs.create({
  url,
});
// 用 ExtensionTransport.connectTab 连接 Puppeteer。
const browser = await connect({
  transport: await ExtensionTransport.connectTab(tab.id),
});
// 此时 browser 对象上只有一个 page，
// 它对应的就是你建立 transport 连接的那个标签页。
const [page] = await browser.pages();
// 接下来就能照常操作 Puppeteer 的 page 了。
console.log(await page.evaluate('document.title'));
browser.disconnect();
```

2. 用打包工具构建你的扩展。例如下面这份配置可以配合 rollup 使用：

```js
import {nodeResolve} from '@rollup/plugin-node-resolve';

export default {
  input: 'main.mjs',
  output: {
    format: 'esm',
    dir: 'out',
  },
  // 如果你不需要使用 WebDriver BiDi 协议，
  // 排除 chromium-bidi/lib/bidiMapper/BidiMapper.js 可以把产物体积压到最小。
  external: ['chromium-bidi/lib/bidiMapper/BidiMapper.js'],
  plugins: [
    nodeResolve({
      // 表明我们的目标是浏览器环境。
      browser: true,
      // 除了 puppeteer-core，其余依赖一律不打包进来。
      // `npm install puppeteer-core` # 需要时用它安装 puppeteer-core。
      resolveOnly: ['puppeteer-core'],
    }),
  ],
};
```
