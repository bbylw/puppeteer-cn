---
title: Chrome 扩展
description: 用 Puppeteer 加载并测试 Chrome 扩展，覆盖扩展的 service worker、background page、popup、扩展动作与 content script。
order: 15
category: guides
source: https://pptr.dev/guides/chrome-extensions
summary:
  - 两种加载方式：启动时传路径，或运行时 installExtension()
  - 拿到 service worker（MV3）或 background page（MV2）的引用
  - popup、触发扩展动作，以及在 content script 上下文里执行代码
---

Puppeteer 可以用来测试 Chrome 扩展。

### 加载扩展

#### 使用 `LaunchOptions`

```ts
import puppeteer from 'puppeteer';
import path from 'path';

const pathToExtension = path.join(process.cwd(), 'my-extension');
const browser = await puppeteer.launch({
  enableExtensions: [pathToExtension],
});
```

#### 在运行时

```ts
import puppeteer from 'puppeteer';
import path from 'path';

const pathToExtension = path.join(process.cwd(), 'my-extension');
const browser = await puppeteer.launch({
  enableExtensions: true,
});

const extensionId = await browser.installExtension(pathToExtension);
```

#### 列出与卸载

你可以用 `browser.extensions()` 方法列出所有已安装的扩展及其属性。要卸载某个扩展，使用 `browser.uninstallExtension()` 方法。

```ts
const extensions = await browser.extensions();
const extension = extensions.get(extensionId);

console.log(extension?.name);
console.log(extension?.version);

await browser.uninstallExtension(extensionId);
```

### 后台上下文

你可以拿到扩展的 service worker 或 background page 的引用，这在扩展上下文里执行代码、或强制终止 service worker 时很有用。

#### Service worker (MV3)

```ts
import puppeteer from 'puppeteer';
import path from 'path';

const pathToExtension = path.join(process.cwd(), 'my-extension');
const browser = await puppeteer.launch({
  enableExtensions: [pathToExtension],
});

const workerTarget = await browser.waitForTarget(
  // 假设该扩展只创建了一个 service worker，并且它的 URL 以 background.js 结尾。
  target =>
    target.type() === 'service_worker' &&
    target.url().endsWith('background.js'),
);

const worker = await workerTarget.worker();

// 在这里测试 service worker。

await browser.close();
```

#### Background page (MV2)

下面是获取扩展 [background page](https://developer.chrome.com/docs/extensions/mv2/background-pages) 句柄的代码，该扩展的源码位于 `./my-extension`：

```ts
import puppeteer from 'puppeteer';
import path from 'path';

const pathToExtension = path.join(process.cwd(), 'my-extension');
const browser = await puppeteer.launch({
  enableExtensions: [pathToExtension],
});
const backgroundPageTarget = await browser.waitForTarget(
  target => target.type() === 'background_page',
);
const backgroundPage = await backgroundPageTarget.page();

// 像测试其他页面一样测试 background page。

await browser.close();
```

### Popup

按[上面所述](#service-worker-mv3)拿到 service worker，然后：

```ts
await worker.evaluate('chrome.action.openPopup();');

const popupTarget = await browser.waitForTarget(
  // 假设只有一个 URL 以 popup.html 结尾的页面，
  // 并且它就是扩展打开的 popup。
  target => target.type() === 'page' && target.url().endsWith('popup.html'),
);

const popupPage = await popupTarget.asPage();

// 像测试其他页面一样测试 popup 页面。

await browser.close();
```

### 触发扩展动作

你可以用 `page.triggerExtensionAction()` 方法触发某个页面的默认扩展动作，效果等同于用户点击工具栏上的扩展按钮。

```ts
const extensions = await browser.extensions();
const extension = extensions.get(extensionId);

// 你可以针对某个页面触发指定扩展的动作。
await page.triggerExtensionAction(extension);

// 也可以直接从扩展对象本身触发。
await extension.triggerAction(page);

// 如果这个动作会打开 popup，随后就可以等待 popup target。
const popupTarget = await browser.waitForTarget(
  target =>
    target.type() === 'page' &&
    target.url().includes(extensionId) &&
    target.url().endsWith('popup.html'),
);
```

### Content scripts（内容脚本）

Content script 会照常注入。用 `browser.newPage()` 和 `page.goto()` 导航到某个会注入 content script 的页面即可。

要在 content script 的上下文里执行代码，可以用 `page.extensionRealms()` 方法找到与该扩展关联的 realm，再调用它的 `evaluate()` 方法。

```ts
// 获取扩展 ID
const extensionId = await browser.installExtension(pathToExtension);

// 找到扩展的 realm。
const realms = page.extensionRealms();
let extensionRealm;
for (const realm of realms) {
  const extension = await realm.extension();
  if (extension?.id === extensionId) {
    extensionRealm = realm;
    break;
  }
}

if (!extensionRealm) {
  throw new Error('Extension realm not found');
}

// 在 content script 上下文里执行代码。
const result = await extensionRealm.evaluate(() => {
  return document.title;
});
```

### 延伸阅读

想进一步了解，见 [Chrome for Developers](https://developer.chrome.com/docs/extensions/how-to/test/end-to-end-testing) 上的文档。
