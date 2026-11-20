---
title: WebDriver BiDi 支持
description: WebDriver BiDi 在 Puppeteer 中的支持情况：如何用 BiDi 启动 Chrome 与 Firefox，以及哪些功能已完整支持、哪些还不支持。
order: 29
category: reference
source: https://pptr.dev/webdriver-bidi
summary:
  - BiDi 是双向通信的新一代跨浏览器自动化协议
  - Firefox 默认走 BiDi，Chrome 默认仍走 CDP
  - 已完整支持与暂不支持的功能清单
---

[WebDriver BiDi](https://w3c.github.io/webdriver-bidi/) 是一个仍在开发中的新一代跨浏览器自动化协议，目标是把 WebDriver “Classic” 和 CDP 各自的优点合到一起。WebDriver BiDi 支持双向通信，因此默认就很快，同时还提供了底层控制能力。

### 用 Chrome 和 Firefox 做自动化

Puppeteer 支持通过 WebDriver BiDi 自动化 Chrome 和 Firefox。用 Puppeteer 启动 Firefox 时，默认就走 WebDriver BiDi 协议；启动 Chrome 时，默认仍然使用 CDP，因为 WebDriver BiDi 还没覆盖全部 CDP 特性。如果某个 Puppeteer 功能暂时无法通过 WebDriver BiDi 实现，就会抛出 [`UnsupportedOperation`](https://pptr.dev/api/puppeteer.unsupportedoperation) 错误。具体哪些功能在 WebDriver BiDi 下可用，见下面的清单。

### 开始使用

下面是在用 WebDriver BiDi 启动 Firefox 或 Chrome 的示例：

```ts
import puppeteer from 'puppeteer';

const firefoxBrowser = await puppeteer.launch({
  browser: 'firefox', // 默认使用 WebDriver BiDi。
});
const page = await firefoxBrowser.newPage();
...
await firefoxBrowser.close();

const chromeBrowser = await puppeteer.launch({
  browser: 'chrome',
  protocol: 'webDriverBiDi', // Chrome 默认使用的是 CDP。
});
const page = await chromeBrowser.newPage();
...
await chromeBrowser.close();
```

### WebDriver BiDi 尚不支持的 Puppeteer 功能

- 各类模拟
  - Page.emulate()
  - Page.emulateCPUThrottling()
  - Page.emulateIdleState()
  - Page.emulateMediaFeatures()
  - Page.emulateMediaType()
  - Page.emulateVisionDeficiency()
  - Page.setBypassCSP()

- CDP 专属功能
  - HTTPRequest.client()
  - HTTPRequest.resourceType()
  - Page.createCDPSession()
  - Page.extensionRealms()
  - Page.triggerExtensionAction()
  - Frame.extensionRealms()
  - Realm.extension()
  - Realm.realmId()

- Accessibility（无障碍）
- Coverage（覆盖率）
- Tracing（性能追踪）

- 其他方法：
  - Frame.waitForDevicePrompt()
  - HTTPResponse.buffer()
  - HTTPResponse.content()
  - HTTPResponse.text()
  - HTTPResponse.fromServiceWorker()
  - HTTPResponse.securityDetails()
  - Input.drag()
  - Input.dragAndDrop()
  - Input.dragOver()
  - Input.drop()
  - Page.emulateNetworkConditions()
  - Page.isDragInterceptionEnabled()
  - Page.isServiceWorkerBypassed()
  - Page.metrics()
  - Page.queryObjects()
  - Page.screencast()
  - Page.setBypassServiceWorker()
  - Page.setDragInterception()
  - Page.setOfflineMode()
  - Page.waitForDevicePrompt()
  - PageEvent.popup

### WebDriver BiDi 已完整支持的 Puppeteer 功能

- 浏览器自动化
  - Browser.close()
  - Browser.userAgent()
  - Browser.version()
  - Puppeteer.launch()

- 页面自动化
  - Frame.goto()（`referer` 和 `referrerPolicy` 除外）
  - Page 的 `'popup'` 事件
  - Page.bringToFront()
  - Page.cookies()
  - Page.deleteCookie()
  - Page.goBack()
  - Page.goForward()
  - Page.goto（`referer` 和 `referrerPolicy` 除外）
  - Page.reload（`ignoreCache` 参数除外）
  - Page.setCacheEnabled()
  - Page.setCookie()
  - Page.setExtraHTTPHeaders()
  - Page.setGeolocation()
  - Page.setViewport（仅 `width`、`height`、`deviceScaleFactor`）
  - Page.waitForFileChooser()
  - Page.workers()
  - PageEvent.WorkerCreated
  - PageEvent.WorkerDestroyed
  - Target.opener()

- [脚本执行](/docs/javascript-execution)：
  - JSHandle.evaluate()
  - JSHandle.evaluateHandle()
  - Page.evaluate()
  - Page.evaluateOnNewDocument()
  - Page.exposeFunction()

- [选择器](/docs/page-interactions)与[定位器（locator）](/docs/page-interactions)，ARIA 除外：
  - Page.$
  - Page.$$
  - Page.$$eval
  - Page.$eval
  - Page.waitForSelector
  - Page.locator() 以及全部 locator API

- 输入
  - ElementHandle.click
  - ElementHandle.uploadFile
  - Keyboard.down
  - Keyboard.press
  - Keyboard.sendCharacter
  - Keyboard.type
  - Keyboard.up
  - Mouse 事件（专门的拖放 API 方法除外）
  - Page.tap
  - TouchScreen.\*

- JavaScript 对话框拦截
  - page.on('dialog')
  - Dialog.\*

- 截图（并非所有参数都支持）
  - Page.screenshot（支持的参数是 `clip`、`encoding`、`fullPage`）

- PDF 生成（并非所有参数都支持）
  - Page.pdf（仅支持 `format`、`height`、`landscape`、`margin`、`pageRanges`、`printBackground`、`scale`、`width`）
  - Page.createPDFStream（仅支持 `format`、`height`、`landscape`、`margin`、`pageRanges`、`printBackground`、`scale`、`width`）

- 权限
  - BrowserContext.clearPermissionOverrides()
  - BrowserContext.overridePermissions()

- 各类模拟
  - Page.emulateTimezone()
  - Page.isJavaScriptEnabled()
  - Page.setJavaScriptEnabled()

- [请求拦截](/docs/network-interception)
  - HTTPRequest.abort()（不支持自定义错误）
  - HTTPRequest.abortErrorReason()
  - HTTPRequest.continue()
  - HTTPRequest.continueRequestOverrides()
  - HTTPRequest.failure()
  - HTTPRequest.finalizeInterceptions()
  - HTTPRequest.interceptResolutionState()
  - HTTPRequest.isInterceptResolutionHandled()
  - HTTPRequest.respond()
  - HTTPRequest.responseForRequest()
  - Page.authenticate()
  - Page.setRequestInterception()
  - Page.setUserAgent()

### 另见

- [WebDriver BiDi - The future of cross-browser automation](https://developer.chrome.com/blog/webdriver-bidi)
- [WebDriver BiDi: 2023 status update](https://developer.chrome.com/blog/webdriver-bidi-2023/)
- [Puppeteer Support for the Cross-Browser WebDriver BiDi Standard](https://hacks.mozilla.org/2023/12/puppeteer-webdriver-bidi/)
