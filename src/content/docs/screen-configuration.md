---
title: 屏幕配置
description: 用 --screen-info 命令行开关配置无头模式的屏幕，并通过 Browser.addScreen、Browser.removeScreen 和 Browser.screens 在运行时动态调整。
order: 20
category: guides
source: https://pptr.dev/guides/screen-configuration
summary:
  - 用 --screen-info 搭出双屏（一横一竖）配置
  - 用 browser.screens 读取当前屏幕信息
  - 运行时动态添加、移除屏幕，仅限无头模式
---

使用 [`--screen-info`](https://chromium.googlesource.com/chromium/src/+/main/components/headless/screen_info/README.md) 命令行开关来配置无头模式下的屏幕。

下面的脚本把 Chrome 配置成双屏：主屏 800x600，横向；副屏 600x800，紧挨在主屏正右侧，竖向。

```ts
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  args: ['--screen-info={800x600 label=1st}{600x800 label=2nd}'],
});

const screens = await browser.screens();
const screenInfos = screens.map(
  s =>
    `Screen [${s.id}]` +
    ` ${s.left},${s.top} ${s.width}x${s.height}` +
    ` label='${s.label}'` +
    ` isPrimary=${s.isPrimary}` +
    ` isExtended=${s.isExtended}` +
    ` isInternal=${s.isInternal}` +
    ` colorDepth=${s.colorDepth}` +
    ` devicePixelRatio=${s.devicePixelRatio}` +
    ` avail=${s.availLeft},${s.availTop} ${s.availWidth}x${s.availHeight}` +
    ` orientation.type=${s.orientation.type}` +
    ` orientation.angle=${s.orientation.angle}`,
);

console.log(`Number of screens: ${screens.length}\n` + screenInfos.join('\n'));

await browser.close();
```

输出：

```
Number of screens: 2
Screen [1] 0,0 800x600 label='1st' isPrimary=true isExtended=true isInternal=false colorDepth=24 devicePixelRatio=1 avail=0,0 800x600 orientation.type=landscapePrimary orientation.angle=0
Screen [2] 800,0 600x800 label='2nd' isPrimary=false isExtended=true isInternal=false colorDepth=24 devicePixelRatio=1 avail=800,0 600x800 orientation.type=portraitPrimary orientation.angle=0
```

如果不带 `--screen-info` 开关，无头模式默认是一块 800x600 的屏幕；但如果指定了 `--window-size` 开关，无头屏幕就会和请求的窗口尺寸一样大。

> **注意**
>
> `--screen-info` 开关只在无头模式可用。有头 Chrome 始终使用平台上真实的物理屏幕。

### 动态配置无头屏幕

使用 Puppeteer 的 [`Browser.addScreen`](https://pptr.dev/next/api/puppeteer.browser.addscreen) 和 [`Browser.removeScreen`](https://pptr.dev/next/api/puppeteer.browser.removescreen) 方法，可以在 Chrome 运行期间添加和移除屏幕。用 [`Browser.screens`](https://pptr.dev/next/api/puppeteer.browser.screens) 方法获取当前的屏幕配置。

下面的脚本在运行期间添加并移除一块副屏，每一步都打印一次屏幕配置。

```ts
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  args: ['--screen-info={800x600 label=1st}'],
});

function getScreenInfo(s) {
  return (
    `Screen [${s.id}]` +
    ` ${s.left},${s.top} ${s.width}x${s.height}` +
    ` label='${s.label}'` +
    ` isPrimary=${s.isPrimary}` +
    ` isExtended=${s.isExtended}`
  );
}

async function logScreenConfig(text) {
  if (text !== undefined) {
    console.log(text);
  }
  const screens = await browser.screens();
  const screenInfos = screens.map(s => getScreenInfo(s));

  console.log(
    `Number of screens: ${screens.length}\n` + screenInfos.join('\n'),
  );
}

await logScreenConfig('---- Initial:');

// 添加一块屏幕。
const addedScreenInfo = await browser.addScreen({
  left: 800,
  top: 0,
  width: 800,
  height: 600,
  label: '2nd',
});

console.log('Added screen: ' + getScreenInfo(addedScreenInfo));
await logScreenConfig('---- With the screen added:');

// 移除刚才添加的屏幕。
await browser.removeScreen(addedScreenInfo.id);
await logScreenConfig('---- With added screen removed:');

await browser.close();
```

输出：

```
---- Initial:
Number of screens: 1
Screen [1] 0,0 800x600 label='1st' isPrimary=true isExtended=false
Added screen: Screen [2] 800,0 800x600 label='2nd' isPrimary=false isExtended=true
---- With the screen added:
Number of screens: 2
Screen [1] 0,0 800x600 label='1st' isPrimary=true isExtended=true
Screen [2] 800,0 800x600 label='2nd' isPrimary=false isExtended=true
---- With added screen removed:
Number of screens: 1
Screen [1] 0,0 800x600 label='1st' isPrimary=true isExtended=false
```

> **注意**
>
> `Browser.addScreen` 和 `Browser.removeScreen` 只在无头模式可用；`Browser.screens` 在有头和无头模式下都能用。
