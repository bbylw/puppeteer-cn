---
title: 页面交互
description: 通过鼠标、触摸和键盘事件操作页面元素：locator 的用法与前置条件、waitForSelector 等底层查询 API，以及 XPath、Text、ARIA 和 Shadow DOM 等自定义选择器语法。
order: 6
category: core-concepts
source: https://pptr.dev/guides/page-interactions
summary:
  - locator 是首选方式，会自动等待元素就绪再执行动作
  - waitForSelector 与 $、$$、$eval、$$eval 属于更底层的 API
  - 除 CSS 选择器外，还支持 XPath、Text、ARIA、pierce 和 Shadow DOM 组合器
---

## 页面交互

Puppeteer 支持通过鼠标、触摸事件和键盘输入来与页面上的元素交互。通常的做法是先用 [CSS 选择器](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors)查询到一个 DOM 元素，再在被选中的元素上调用某个动作。所有接受选择器的 Puppeteer API 默认接受的都是 [CSS 选择器](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors)。除此之外，Puppeteer 还提供了[自定义选择器语法](#选择器)，让你能用 XPath、文本、无障碍（accessibility）属性来查找元素，还能在不执行 JavaScript 的情况下访问 Shadow DOM。

如果你想在不先选中元素的前提下直接派发鼠标或键盘事件，请使用 [`page.mouse`](https://pptr.dev/api/puppeteer.mouse)、[`page.keyboard`](https://pptr.dev/api/puppeteer.keyboard) 和 [`page.touchscreen`](https://pptr.dev/api/puppeteer.touchscreen) 这几个 API。本指南余下的内容，讲的是如何选中 DOM 元素并在它们上面执行动作。

### locator（定位器）

locator 是选中并操作元素的推荐方式。locator 把“该怎么选中一个元素”这些信息封装了起来，因此 Puppeteer 可以自动等待元素出现在 DOM 里、并且处于适合执行该动作的状态。你始终通过 [`page.locator()`](https://pptr.dev/api/puppeteer.page.locator) 或 [`frame.locator()`](https://pptr.dev/api/puppeteer.frame.locator) 函数来创建一个 locator。如果 locator API 里没有你需要的功能，你仍然可以使用更底层的 API，比如 [`page.waitForSelector()`](https://pptr.dev/api/puppeteer.page.waitforselector) 或 [`ElementHandle`](https://pptr.dev/api/puppeteer.elementhandle)。

#### 用 locator 点击元素

```ts
// 'button' 是一个 CSS 选择器。
await page.locator('button').click();
```

locator 在点击之前会自动检查下面这些条件：

- 确认元素在视口（viewport）内。
- 等待元素变为[可见](https://pptr.dev/api/puppeteer.elementhandle.isvisible)或隐藏。
- 等待元素变为可用（enabled）。
- 等待元素在连续两个动画帧里保持 bounding box（包围盒）稳定。

#### 填写输入框

```ts
// 'input' 是一个 CSS 选择器。
await page.locator('input').fill('value');
```

它会自动判断输入框的类型，并选择合适的办法把给定的值填进去。比如 `<select>` 元素和 `<input>` 元素它都能填。

locator 在往输入框里输入之前会自动检查下面这些条件：

- 确认元素在视口内。
- 等待元素变为[可见](https://pptr.dev/api/puppeteer.elementhandle.isvisible)或隐藏。
- 等待元素变为可用。
- 等待元素在连续两个动画帧里保持 bounding box 稳定。

##### 悬停在元素上

```ts
await page.locator('div').hover();
```

locator 在悬停之前会自动检查下面这些条件：

- 确认元素在视口内。
- 等待元素变为[可见](https://pptr.dev/api/puppeteer.elementhandle.isvisible)或隐藏。
- 等待元素在连续两个动画帧里保持 bounding box 稳定。

##### 滚动元素

`.scroll()` 函数用鼠标滚轮事件来滚动某个元素。

```ts
// 让 div 元素水平滚动 10px，垂直滚动 20px。
await page.locator('div').scroll({
  scrollLeft: 10,
  scrollTop: 20,
});
```

locator 在滚动之前会自动检查下面这些条件：

- 确认元素在视口内。
- 等待元素变为[可见](https://pptr.dev/api/puppeteer.elementhandle.isvisible)或隐藏。
- 等待元素在连续两个动画帧里保持 bounding box 稳定。

#### 等待元素可见

有时候你只需要等元素变成可见。

```ts
// '.loading' 是一个 CSS 选择器。
await page.locator('.loading').wait();
```

locator 在返回之前会自动检查下面这些条件：

- 等待元素变为[可见](https://pptr.dev/api/puppeteer.elementhandle.isvisible)或隐藏。

#### 用函数等待某个条件

有时候需要等的是一个任意条件，用 JavaScript 函数来表达。这种情况下，locator 可以用一个函数来定义，而不是用选择器。下面的例子会一直等到页面上至少出现 3 个段落，然后取出它们的文本。你也可以改为调用 `.click()`、`.fill()` 这类 locator 函数，而不是把元素映射成文本。

```ts
const paragraphs = await page
  .locator(() => {
    const paragraphs = document.querySelectorAll('p');

    if (paragraphs.length >= 3) {
      return [...paragraphs].map(p => p.textContent);
    }
  })
  .wait();
```

#### 给 locator 加过滤条件

下面的例子演示怎么用 JavaScript 函数给 locator 追加额外条件。只有当 button 元素的 `textContent` 是 'My button' 时，它才会被点击。

```ts
await page
  .locator('button')
  .filter(button => button.textContent === 'My button')
  .click();
```

由于 `.filter()` 的回调是在浏览器上下文里执行的，它访问不到 Node 作用域里的变量。你可以把参数传给过滤函数：

```ts
const buttonName = 'My button';
await page
  .locator('button')
  .filter((button, buttonName) => button.textContent === buttonName, buttonName)
  .click();
```

#### 从 locator 返回值

[`map`](https://pptr.dev/api/puppeteer.locator.map) 函数可以把一个元素映射成一个 JavaScript 值。这种情况下，调用 `wait()` 返回的就是反序列化之后的 JavaScript 值。

```ts
const enabled = await page
  .locator('button')
  .map(button => !button.disabled)
  .wait();
```

#### 从 locator 返回 ElementHandle

[`waitHandle`](https://pptr.dev/api/puppeteer.locator.waithandle) 函数可以返回 [ElementHandle](https://pptr.dev/api/puppeteer.elementhandle)。当你需要的动作没有对应的 locator API 时，它就派上用场了。

```ts
const buttonHandle = await page.locator('button').waitHandle();
await buttonHandle.click();
```

#### 配置 locator

locator 可以被配置，用来调整前面说的那些前置条件以及其他选项：

```ts
// 不等任何前置条件，直接点击按钮。
await page
  .locator('button')
  .setEnsureElementIsInTheViewport(false)
  .setVisibility(null)
  .setWaitForEnabled(false)
  .setWaitForStableBoundingBox(false)
  .click();
```

#### locator 的超时

默认情况下，locator 继承页面的超时设置。不过也可以给单个 locator 单独设置超时。如果在指定时间内没找到元素，或者前置条件一直没满足，就会抛出 [TimeoutError](https://pptr.dev/api/puppeteer.timeouterror)。

```ts
// 3 秒后超时。
await page.locator('button').setTimeout(3000).click();
```

#### 监听 locator 事件

目前 locator 支持[一种事件](https://pptr.dev/api/puppeteer.locatorevents)，在 locator 即将执行动作时通知你，也就是说此时前置条件都已满足：

```ts
let willClick = false;
await page
  .locator('button')
  .on(LocatorEvent.Action, () => {
    willClick = true;
  })
  .click();
```

这个事件可以用来打日志、调试，或者别的用途。如果 locator 重试某个动作，这个事件可能会触发多次。

### waitForSelector

[`waitForSelector`](https://pptr.dev/api/puppeteer.page.waitforselector) 相比 locator 是更底层的 API，它只负责等待某个元素在 DOM 里可用。动作失败时它不会自动重试，而且需要你手动 dispose 返回的 ElementHandle，以免内存泄漏。Page、Frame 和 ElementHandle 实例上都有这个方法。

```ts
// 引入 puppeteer
import puppeteer from 'puppeteer';

// 启动浏览器。
const browser = await puppeteer.launch();

// 新建一个页面。
const page = await browser.newPage();

// 打开你的站点。
await page.goto('YOUR_SITE');

// 查询一个元素句柄。
const element = await page.waitForSelector('div > .class-name');

// 对 element 做点什么……
await element.click(); // 举个例子而已。

// 释放句柄。
await element.dispose();

// 关闭浏览器。
await browser.close();
```

一些 page 级别的 API，比如 `page.click(selector)`、`page.type(selector)`、`page.hover(selector)`，出于向后兼容的考虑，内部是用 `waitForSelector` 实现的。

### 不等待直接查询

有时候你很清楚元素已经在页面上了。这种情况下，Puppeteer 提供了好几种方式来查找单个元素，或者查找所有匹配某个选择器的元素。这些方法在 Page、Frame 和 ElementHandle 实例上都存在。

- [`page.$()`](https://pptr.dev/api/puppeteer.page._) 返回匹配选择器的单个元素。
- [`page.$$()`](https://pptr.dev/api/puppeteer.page.__) 返回匹配选择器的所有元素。
- [`page.$eval()`](https://pptr.dev/api/puppeteer.page._eval) 返回把一个 JavaScript 函数作用到匹配选择器的第一个元素上得到的结果。
- [`page.$$eval()`](https://pptr.dev/api/puppeteer.page.__eval) 返回把一个 JavaScript 函数作用到每个匹配选择器的元素上得到的结果。

### 选择器

在任何接受选择器的 API 里，Puppeteer 都接受 [CSS 选择器](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors)。除此之外，你还可以选择启用额外的选择器语法，做到 CSS 选择器做不到的事。

#### 非 CSS 选择器

Puppeteer 在 CSS 语法之上扩展了一些自定义[伪元素](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements)，用来声明如何以非 CSS 选择器的方式选中元素。Puppeteer 支持的这些伪元素都带有 `-p` 这个厂商前缀。

##### XPath 选择器（`-p-xpath`）

XPath 选择器会使用浏览器原生的 [`Document.evaluate`](https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate) 来查询元素。

```ts
// 把 `//h2` 当作 XPath 表达式执行。
const element = await page.waitForSelector('::-p-xpath(//h2)');
```

##### Text 选择器（`-p-text`）

Text 选择器会选中包含给定文本的“最小”元素，即使在（开放的）shadow root 内部也一样。这里的“最小”指的是包含给定文本的最深层元素，而不是它们的父元素（父元素严格来说也包含这段文本）。

```ts
// 点击一个 div 元素内部的按钮，它的内部文本是 Checkout。
await page.locator('div ::-p-text(Checkout)').click();
// 如果搜索文本里含有 CSS 选择器语法字符，比如 '(' 和 ')'（'Checkout (2 items)'），就需要转义。
await page.locator(':scope >>> ::-p-text(Checkout \\(2 items\\))').click();
// 或者用引号包住，并转义文本中本身含有的引号（'He said: "Hello"'）。
await page.locator(':scope >>> ::-p-text("He said: \\"Hello\\"")').click();
```

##### ARIA 选择器（`-p-aria`）

ARIA 选择器可以用计算出来的 accessible name（无障碍名称）和 role（角色）来查找元素。这些标签是根据浏览器内部维护的无障碍树算出来的，也就是说 ARIA 之间的关系（比如 labeledby）在查询执行之前就已经解析好了。如果你不想依赖具体的 DOM 结构或 DOM 属性，ARIA 选择器就很有用。

```ts
await page.locator('::-p-aria(Submit)').click();
await page.locator('::-p-aria([name="Click me"][role="button"])').click();
```

##### Pierce 选择器（`pierce/`）

Pierce 选择器会返回文档里所有 shadow root 中匹配给定 CSS 选择器的元素。我们更推荐用[深度组合器（deep combinators）](#查询-shadow-dom-中的元素)，因为组合不同选择器时它更灵活。`pierce/` 只在[前缀式语法](#前缀式选择器语法)里可用。

```ts
await page.locator('pierce/div').click();
// 用深度组合器写出与 pierce/ 等价的查询。
await page.locator('& >>> div').click();
```

#### 查询 Shadow DOM 中的元素

CSS 选择器不允许往下进入 Shadow DOM，因此 Puppeteer 在 CSS 选择器语法里加了两个组合器，用来在 [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) 里搜索。

##### `>>>` 组合器

`>>>` 叫做 _deep descendant_（深度后代）组合器。它类似于 CSS 的后代组合器（用一个空格字符表示，比如 `div button`），会选中父元素之下任意深度里匹配的元素。举个例子，`my-custom-element >>> button` 会选中 `my-custom-element`（shadow host）的 shadow DOM 里所有可用的 button 元素。

> **说明**
>
> 深度组合器只在 CSS 选择器的第一层“深度”和开放的 shadow root 上生效；比如 `:is(div > > a)` 就用不了。

##### `>>>>` 组合器

`>>>>` 叫做 _deep child_（深度子元素）组合器。它类似于 CSS 的子组合器（用 `>` 表示，比如 `div > button`），会在父元素的直接 shadow root 之下选中匹配的元素（前提是这个元素有 shadow root）。举个例子，`my-custom-element >>>> button` 会选中 `my-custom-element`（shadow host）的直接 shadow root 里所有可用的 button 元素。

#### 自定义选择器

你也可以用 [Puppeteer.registerCustomQueryHandler](https://pptr.dev/api/puppeteer.puppeteer.registercustomqueryhandler) 添加自己的伪元素。当你想基于框架对象或自己的应用来实现自定义选择器时，这就很有用。

比如，你可以全部用 `react-component` 伪元素来写选择器，并自己实现解析传入 ID 的逻辑。

```ts
Puppeteer.registerCustomQueryHandler('react-component', {
  queryOne: (elementOrDocument, selector) => {
    // 这个演示例子只是委托给 querySelector，
    // 但由于回调在页面上下文里运行，你完全可以据此找到自己的 React 组件。
    return elementOrDocument.querySelector(`[id="${CSS.escape(selector)}"]`);
  },
  queryAll: (elementOrDocument, selector) => {
    // 这个演示例子只是委托给 querySelectorAll，
    // 但由于回调在页面上下文里运行，你完全可以据此找到自己的 React 组件。
    return elementOrDocument.querySelectorAll(`[id="${CSS.escape(selector)}"]`);
  },
});
```

在你的应用里，就可以按下面的方式写选择器。

```ts
await page.locator('::-p-react-component(MyComponent)').click();
// 或者和其他选择器一起用。
await page.locator('.side-bar ::-p-react-component(MyComponent)').click();
```

再举一个例子，演示如何为定位 vue 组件定义一个自定义查询处理器：

> **注意**
>
> 依赖库或框架的内部 API 时要小心，它们随时可能发生变化。

```ts
Puppeteer.registerCustomQueryHandler('vue', {
  queryOne: (element, name) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT);
    do {
      const currentNode = walker.currentNode;
      if (
        currentNode.__vnode?.ctx?.type?.name.toLowerCase() ===
        name.toLocaleLowerCase()
      ) {
        return currentNode;
      }
    } while (walker.nextNode());

    return null;
  },
});
```

按下面的方式查找指定的视图组件：

```ts
const element = await page.$('::-p-vue(MyComponent)');
```

#### 前缀式选择器语法

> **注意**
>
> 虽然我们仍然维护着前缀式选择器，但推荐的做法是使用上面介绍的那些选择器语法。

下面这种遗留语法（`${nonCssSelectorName}/${nonCssSelector}`）也在支持之列，但它一次只能运行一个非 CSS 选择器。注意这种语法不允许把多个选择器组合起来。

```ts
// 等价于 ::-p-text("My text")。
await page.locator('text/My text').click();
// 等价于 ::-p-xpath(//h2)。
await page.locator('xpath///h2').click();
// 等价于 ::-p-aria(My label)。
await page.locator('aria/My label').click();

await page.locator('pierce/div').click();
```
