---
title: 在浏览器里运行 Puppeteer
description: Puppeteer 的 API 也能跑在网页里：用打包工具构建浏览器可用的产物，通过 WebSocket 连接一个开着调试端口的远程浏览器。
order: 18
category: guides
source: https://pptr.dev/guides/running-puppeteer-in-the-browser
summary:
  - 浏览器内运行时支持哪些能力
  - 用 puppeteer-core 的浏览器专用入口加 puppeteer.connect
  - rollup 配置与产物引入网页
---

Puppeteer 是自动化浏览器的利器，但你可能不知道它的 API 也能运行在浏览器内部。这让你在不需要 Node.js 特有功能的场景下，照样能用 Puppeteer 干活。

> **说明**
>
> 需要注意的是，Puppeteer API 虽然可以跑在客户端网页里，但自动化操作会发送到一个开着调试端口的独立浏览器。

### 支持的功能

在浏览器里运行时，Puppeteer 提供的功能包括：

1. WebSocket 连接：用 WebSocket 连接到已有的浏览器实例。直接启动或下载浏览器不支持，因为这依赖 Node.js 的 API。
2. 脚本执行：在远程浏览器的上下文里执行 JavaScript 代码。
3. 文档操作：为远程浏览器的页面生成 PDF 和截图。
4. 页面管理：在远程浏览器里创建、关闭页面，并在不同页面之间导航。
5. Cookie 处理：查看、修改和管理远程浏览器中的 Cookie。
6. 网络控制：监听并拦截远程浏览器发出的网络请求。

### 如何在浏览器里运行 Puppeteer

> **说明**
>
> 完整示例见 https://github.com/puppeteer/puppeteer/tree/main/examples/puppeteer-in-browser 。

要在浏览器里运行 Puppeteer，首先需要用 rollup 或 webpack 这类打包工具产出浏览器可用的构建：

1. 导入 Puppeteer 时，使用 puppeteer-core 提供的浏览器专用入口 `puppeteer-core/lib/puppeteer/puppeteer-core-browser.js`：

```ts
import puppeteer from 'puppeteer-core/lib/puppeteer/puppeteer-core-browser.js';

const browser = await puppeteer.connect({
  browserWSEndpoint: wsUrl,
});

alert('Browser has ' + (await browser.pages()).length + ' pages');

browser.disconnect();
```

2. 用打包工具构建你的应用。例如下面这份配置可以配合 rollup 使用：

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

> **说明**
>
> 连接远程浏览器实例时，别忘了填入一个有效的浏览器 WebSocket 端点。

3. 把打好的产物引入网页。
