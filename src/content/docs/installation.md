---
title: 安装
description: 在你的项目里安装 Puppeteer，理解浏览器下载、安装脚本被拦截时的处理办法，以及 puppeteer 与 puppeteer-core 的区别。
order: 2
source: https://pptr.dev/guides/installation
summary:
  - 一条 npm 命令，以及它顺手下载了什么
  - 包管理器拦截安装脚本时的两种解决办法
  - puppeteer 与 puppeteer-core 各自该在什么时候用
---

在你的项目里使用 Puppeteer，运行：

```bash
npm i puppeteer
```

安装 Puppeteer 时，它会自动下载一个较新的 [Chrome for Testing](https://developer.chrome.com/blog/chrome-for-testing/) 版本（macOS 约 170MB，Linux 约 282MB，Windows 约 280MB），以及一个 `chrome-headless-shell` 二进制（自 Puppeteer v21.6.0 起提供），这个组合[保证](https://pptr.dev/faq#q-why-doesnt-puppeteer-vxxx-work-with-a-certain-version-of-chrome-or-firefox)与 Puppeteer 兼容。浏览器默认下载到 `$HOME/.cache/puppeteer` 目录（自 Puppeteer v19.0.0 起）。配置项与控制下载行为的环境变量，见 [configuration](https://pptr.dev/api/puppeteer.configuration)。

## 自动下载可能被阻止

许多现代包管理器（例如遵循新 [RFC](https://github.com/npm/rfcs/pull/868) 的 npm、pnpm、Yarn Berry、Bun 和 Deno）默认会阻止依赖的安装脚本。如果你的包管理器被配置为阻止这些脚本，自动下载就会被跳过，运行 Puppeteer 时会抛出错误：`Could not find Chrome (ver. ...).`

要解决这个问题，你可以：

1. **在安装依赖之后手动安装浏览器**，运行：

   ```bash
   npx puppeteer browsers install
   ```

2. **重新允许 Puppeteer 的 postinstall 脚本执行**，例如对于 npm，在 `package.json` 的 `"allowScripts"` 中加入 `"puppeteer"`：

   ```json
   {
     "allowScripts": {
       "puppeteer": true
     }
   }
   ```

## 两个包

自 v1.7.0 起，每个版本我们都会发布两个包：

- [`puppeteer`](https://www.npmjs.com/package/puppeteer)
- [`puppeteer-core`](https://www.npmjs.com/package/puppeteer-core)

`puppeteer` 是一个**产品**，用于浏览器自动化。安装时它会下载一份 Chrome，然后通过 `puppeteer-core` 来驱动它。作为面向终端用户的产品，`puppeteer` 会使用合理的默认值自动完成一系列工作流，这些默认值[都可以自定义](https://pptr.dev/guides/configuration)。

`puppeteer-core` 是一个**库**，用来驱动任何支持 DevTools 协议的东西。作为库，它完全通过编程接口驱动，不假定任何默认值，安装时也不会下载 Chrome。

如果你要[连接远程浏览器](https://pptr.dev/api/puppeteer.puppeteer.connect)或者[自己管理浏览器](https://pptr.dev/browsers-api)，就应该用 `puppeteer-core`。自己管理浏览器时，你需要在调用 [`puppeteer.launch`](https://pptr.dev/api/puppeteer.puppeteernode.launch) 时显式传入 [`executablePath`](https://pptr.dev/api/puppeteer.launchoptions)（或者传入 [`channel`](https://pptr.dev/api/puppeteer.launchoptions)，前提是浏览器安装在标准位置）。

使用 `puppeteer-core` 时，记得修改导入语句：

```ts
import puppeteer from 'puppeteer-core';
```
