---
title: 窗口管理
description: 用 Browser.getWindowBounds 和 Browser.setWindowBounds 管理浏览器窗口的位置与状态，并可调整页面内容尺寸或让元素进入全屏。
order: 21
category: guides
source: https://pptr.dev/guides/window-management
summary:
  - 读取、设置窗口边界，切换 maximized 与 normal
  - 用 Page.resize 让内容区达到指定尺寸
  - 元素全屏后窗口边界的变化
---

使用 Puppeteer 的 [`Browser.getWindowBounds`](https://pptr.dev/api/puppeteer.browser.getwindowbounds) 和 [`Browser.setWindowBounds`](https://pptr.dev/api/puppeteer.browser.setwindowbounds) 方法来管理浏览器窗口的位置和状态。

下面的脚本在 800x600 主屏的默认位置打开一个窗口，然后把这个窗口移动到新创建的屏幕上并最大化，最后再把窗口恢复到普通状态。

```ts
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  args: ['--screen-info={800x600}'],
});

async function logWindowBounds() {
  const bounds = await browser.getWindowBounds(windowId);
  console.log(
    `${bounds.left},${bounds.top}` +
      ` ${bounds.width}x${bounds.height}` +
      ` ${bounds.windowState}`,
  );
}

// 新建一个页面。
const page = await browser.newPage({type: 'window'});
const windowId = await page.windowId();
await logWindowBounds();

// 在主屏右侧添加一块屏幕。
const screenInfo = await browser.addScreen({
  left: 800,
  top: 0,
  width: 1600,
  height: 1200,
});

// 把窗口移动到新创建的副屏上。
await browser.setWindowBounds(windowId, {
  left: screenInfo.left + 50,
  top: screenInfo.top + 50,
  width: screenInfo.width - 100,
  height: screenInfo.height - 100,
});
await logWindowBounds();

// 最大化窗口。
await browser.setWindowBounds(windowId, {windowState: 'maximized'});
await logWindowBounds();

// 恢复窗口。
await browser.setWindowBounds(windowId, {windowState: 'normal'});
await logWindowBounds();

await browser.close();
```

输出：

```
20,20 780x580 normal
850,50 1500x1100 normal
800,0 1600x1200 maximized
850,50 1500x1100 normal
```

### 调整页面内容尺寸

使用 Puppeteer 的 [`Page.resize`](https://pptr.dev/api/puppeteer.page.resize) 方法调整浏览器窗口大小，让内容区正好是指定的尺寸。

示例：

```ts
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  args: ['--screen-info={800x600}'],
});

const page = (await browser.pages())[0];

// 默认 viewport 会把窗口限制在 800x600，所以先移除它。
await page.setViewport(null);

// 窗口内部尺寸是异步更新的，
// 因此先等窗口尺寸变化上报，再把它打印出来。
const resized = page.evaluate(() => {
  return new Promise(resolve => {
    window.onresize = resolve;
  });
});

await page.resize({contentWidth: 600, contentHeight: 400});
await resized;

const result = await page.evaluate(() => {
  return (
    `Inner size: ${window.innerWidth}x${window.innerHeight}\n` +
    `Outer size: ${window.outerWidth}x${window.outerHeight}`
  );
});

console.log(result);

await browser.close();
```

输出：

```
Inner size: 600x400
Outer size: 600x487
```

### 全屏元素

下面的例子演示了如何给某个元素绑定点击事件，让它进入全屏模式。

```ts
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  args: ['--screen-info={1600x1200}'],
});

const page = (await browser.pages())[0];
await page.setContent(`
    <div id="click-box" style="width: 10px; height: 10px;"/>
  `);

await page.evaluate(() => {
  const element = document.getElementById('click-box');
  element.addEventListener('click', () => {
    element.requestFullscreen();
  });
});

await page.click('#click-box');

const windowId = await page.windowId();
const bounds = await browser.getWindowBounds(windowId);
console.log(
  `${bounds.left},${bounds.top}` +
    ` ${bounds.width}x${bounds.height}` +
    ` ${bounds.windowState}`,
);

await browser.close();
```

输出：

```
0,0 1600x1200 fullscreen
```
