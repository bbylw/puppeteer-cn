---
title: Angular
description: 用 Puppeteer 官方的 Angular schematic 给 Angular CLI 项目加上端到端测试，包括安装选项、单文件生成，以及从 Protractor 迁移的对照说明。
order: 24
category: integrations
source: https://pptr.dev/guides/ng-schematics
summary:
  - ng add 一条命令装好 e2e 测试脚手架
  - 支持 Jasmine、Jest、Mocha 和 Node Test Runner
  - Protractor 到 Puppeteer 的 API 对照与迁移示例
---

Puppeteer 的 Angular Schematic 会给你的 Angular 项目加上基于 Puppeteer 的端到端（e2e）测试。

### 开始使用

在一个 Angular CLI 应用目录里运行下面的命令，然后按提示操作。

> 注意，这会把这个 schematic 作为依赖添加到你的项目里。

```bash
ng add @puppeteer/ng-schematics
```

你也可以用同一条命令，并在后面直接带上“选项”一节里列出的参数。

目前这个 schematic 支持以下测试运行器：

- [**Jasmine**](https://jasmine.github.io/)
- [**Jest**](https://jestjs.io/)
- [**Mocha**](https://mochajs.org/)
- [**Node Test Runner**](https://nodejs.org/api/test.html)

装好 schematic 之后，就可以运行 e2e 测试了：

```bash
ng e2e
```

#### 选项

往项目里添加 schematic 时，你可以提供以下选项：

| 选项            | 说明                                       | 取值                                       | 是否必填 |
| --------------- | ------------------------------------------ | ------------------------------------------ | -------- |
| `--test-runner` | 要和 Puppeteer 一起安装的测试框架。        | `"jasmine"`, `"jest"`, `"mocha"`, `"node"` | `true`   |

### 创建单个测试文件

Puppeteer Angular Schematic 还提供了只创建一个测试文件的方法。

```bash
ng generate @puppeteer/ng-schematics:e2e "<TestName>"
```

#### 同时运行测试服务器和开发服务器

默认情况下，e2e 测试会和 `ng start` 用同一个端口来跑应用。要避免冲突，可以在 `angular.json` 里指定端口。把 `e2e` 或 `puppeteer` 这两者中的一项（取决于你最初的选择）改成：

```json
{
  "e2e": {
    "builder": "@puppeteer/ng-schematics:puppeteer",
    "options": {
      "commands": [...],
      "devServerTarget": "sandbox:serve",
      "testRunner": "<TestRunner>",
      "port": 8080
    },
    ...
}
```

然后把 e2e 测试文件 `utils.ts` 里的 baseUrl 改成：

```ts
const baseUrl = 'http://localhost:8080';
```

### 参与贡献

想了解一下在 Puppeteer 仓库里开发需要什么，请看我们的[贡献指南](/docs/contributing)。

#### 沙箱冒烟测试

为了让集成验证更省事，你可以用一条命令跑冒烟测试：它会新建一个全新安装的 Angular 项目（包含单个应用和多个应用两种工程），在里面装上这个 schematic，然后跑最初的 e2e 测试：

```bash
node tools/smoke.mjs
```

#### 单元测试

这个 schematic 用 `@angular-devkit/schematics/testing` 来校验文件是否正确创建、`package.json` 是否正确更新。运行测试套件：

```bash
npm run test
```

### 从 Protractor 迁移

#### 入口

Puppeteer 有自己的 [`browser`](https://pptr.dev/api/puppeteer.browser)，它暴露的是浏览器进程。如果要对标 Protractor 的 `browser`，更接近的其实是 Puppeteer 的 [`page`](https://pptr.dev/api/puppeteer.page)。

```ts
// 测试框架相关的导入

import {setupBrowserHooks, getBrowserState} from './utils';

describe('<Test Name>', function () {
  setupBrowserHooks();
  it('is running', async function () {
    const {page} = getBrowserState();
    // 查询元素
    await page
      .locator('my-component')
      // 找到元素后点击它
      .click();
  });
});
```

#### 获取元素属性

你可以方便地拿到元素的任意属性。

```ts
// 测试框架相关的导入

import {setupBrowserHooks, getBrowserState} from './utils';

describe('<Test Name>', function () {
  setupBrowserHooks();
  it('is running', async function () {
    const {page} = getBrowserState();
    // 查询元素
    const elementText = await page
      .locator('.my-component')
      .map(button => button.innerText)
      // 等元素出现
      .wait();

    // 用断言库做断言
  });
});
```

#### 查询选择器

Puppeteer 支持多种选择器，分别是 CSS、ARIA、text、XPath 和 pierce 选择器。下表列出了 [Protractor By](https://www.protractortest.org/#/api?view=ProtractorBy) 对应的 Puppeteer 写法。

> 想要更稳定、更少 flaky，可以试试**实验性的** [Locators API](/docs/page-interactions)。

| By                | Protractor 代码                                         | Puppeteer querySelector                                  |
| ----------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| CSS（单个）       | `$(by.css('<CSS>'))`                                    | `page.$('<CSS>')`                                        |
| CSS（多个）       | `$$(by.css('<CSS>'))`                                   | `page.$$('<CSS>')`                                       |
| Id                | `$(by.id('<ID>'))`                                      | `page.$('#<ID>')`                                        |
| CssContainingText | `$(by.cssContainingText('<CSS>', '<TEXT>'))`            | `page.$('<CSS> ::-p-text(<TEXT>)')`                      |
| DeepCss           | `$(by.deepCss('<CSS>'))`                                | `page.$(':scope >>> <CSS>')`                             |
| XPath             | `$(by.xpath('<XPATH>'))`                                | `page.$('::-p-xpath(<XPATH>)')`                          |
| JS                | `$(by.js('document.querySelector("<CSS>")'))`           | `page.evaluateHandle(() => document.querySelector('<CSS>'))` |

> 高级用法（比如对应 Protractor 的 `by.addLocator`）可以看 Puppeteer 的[自定义选择器](/docs/page-interactions)。

#### 交互操作

Puppeteer 提供了测试你的应用所需的各项交互操作。

```ts
// 点击元素。
element(locator).click();
// Puppeteer 的等价写法
await page.locator(locator).click();

// 向元素（通常是 input）发送按键。
element(locator).sendKeys('my text');
// Puppeteer 的等价写法
await page.locator(locator).fill('my text');

// 清空元素里的文本（通常是 input）。
element(locator).clear();
// Puppeteer 的等价写法
await page.locator(locator).fill('');

// 获取某个属性的值，例如拿到 input 的值。
element(locator).getAttribute('value');
// Puppeteer 的等价写法
const element = await page.locator(locator).waitHandle();
const value = await element.getProperty('value');
```

#### 示例

一段 Protractor 测试样例：

```ts
describe('Protractor Demo', function () {
  it('should add one and two', function () {
    browser.get('https://juliemr.github.io/protractor-demo/');
    element(by.model('first')).sendKeys(1);
    element(by.model('second')).sendKeys(2);

    element(by.id('gobutton')).click();

    expect(element(by.binding('latest')).getText()).toEqual('3');
  });
});
```

迁移成 Puppeteer 之后的写法：

```ts
import {setupBrowserHooks, getBrowserState} from './utils';

describe('Puppeteer Demo', function () {
  setupBrowserHooks();
  it('should add one and two', function () {
    const {page} = getBrowserState();
    await page.goto('https://juliemr.github.io/protractor-demo/');

    await page.locator('.form-inline > input:nth-child(1)').fill('1');
    await page.locator('.form-inline > input:nth-child(2)').fill('2');
    await page.locator('#gobutton').fill('2');

    const result = await page
      .locator('.table tbody td:last-of-type')
      .map(header => header.innerText)
      .wait();

    expect(result).toEqual('3');
  });
});
```
