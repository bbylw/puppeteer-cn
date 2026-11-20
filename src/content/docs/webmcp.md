---
title: WebMCP
description: WebMCP 是一个实验性 API，允许网页注册可被浏览器或外部 agent 发现并调用的工具；本文介绍 Puppeteer 中与之交互的实验性 API。
order: 22
category: guides
source: https://pptr.dev/guides/webmcp
summary:
  - 需要 Chrome 151+ 并加上 --enable-features=WebMCP
  - 用 page.webmcp 发现、执行页面注册的工具
  - 监听 toolsadded / toolinvoked 等事件
  - 页面侧的命令式与表单声明式注册
---

> **注意**
>
> WebMCP 是一个实验性 API，仍可能变动。目前只有 Chrome 151+ 支持，并且需要开启特定 flag。

[WebMCP](https://github.com/webmachinelearning/webmcp) 是一个实验性 API，允许网页注册工具，这些工具可以被浏览器或外部 agent（比如 LLM）发现并调用。Puppeteer 提供了一个实验性 API，用来和启用了 WebMCP 的页面交互。

### 前置条件

要在 Puppeteer 里使用 WebMCP，你需要：

1.  **Chrome 151+**：浏览器必须支持 WebMCP 的 CDP domain。
2.  **开启对应的 flag**：启动浏览器时必须带上以下开关：
    - `--enable-features=WebMCP`

### 启用 WebMCP

在 Puppeteer 里，WebMCP 能力通过 [`page.webmcp`](https://pptr.dev/api/puppeteer.webmcp) 属性提供。如果浏览器支持，那么在你导航到某个页面时它会自动初始化。

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  args: ['--enable-features=WebMCP'],
});
const page = await browser.newPage();

// 现在 page.webmcp 可用了
console.log(page.webmcp);
```

### 发现工具

用 `page.webmcp.tools()` 可以拿到页面上注册的全部工具列表。你还可以监听 `toolsadded` 和 `toolsremoved` 事件，以便在注册的工具发生变化时作出响应。

```ts
// 获取当前注册的工具
const tools = page.webmcp.tools();
for (const tool of tools) {
  console.log(`Tool found: ${tool.name} - ${tool.description}`);
}

// 监听新加入的工具
page.webmcp.on('toolsadded', event => {
  for (const tool of event.tools) {
    console.log(`New tool added: ${tool.name}`);
  }
});

// 监听被移除的工具
page.webmcp.on('toolsremoved', event => {
  for (const tool of event.tools) {
    console.log(`Tool removed: ${tool.name}`);
  }
});
```

### 执行工具

在 `WebMCPTool` 对象上调用 `execute` 方法即可执行一个已发现的工具。该方法返回一个 promise，结果就是工具的输出。

```ts
const tools = page.webmcp.tools();
const tool = tools.find(t => t.name === 'calculate_sum');

if (tool) {
  const result = await tool.execute({a: 5, b: 10});
  if (result.status === 'Completed') {
    console.log('Result:', result.output);
  } else {
    console.error('Error:', result.errorText);
  }
}
```

#### 取消工具执行

传入一个 `AbortSignal`，就可以取消正在进行的工具执行：

```ts
const controller = new AbortController();

// 2 秒后取消执行
setTimeout(() => {
  controller.abort();
}, 2000);

const result = await tool.execute(
  {query: 'large data processing'},
  {signal: controller.signal},
);

if (result.status === 'Canceled') {
  console.log('Tool execution was canceled.');
}
```

### 处理工具调用

你可以观察工具何时被页面或浏览器调用、何时作出响应。

```ts
page.webmcp.on('toolinvoked', call => {
  console.log(`Tool ${call.tool.name} was invoked with input:`, call.input);
});

page.webmcp.on('toolresponded', response => {
  console.log(
    `Tool ${response.call?.tool.name} responded with status: ${response.status}`,
  );
  if (response.status === 'Completed') {
    console.log('Output:', response.output);
  } else if (response.status === 'Canceled') {
    console.log('Invocation was canceled');
  } else {
    console.log('Error:', response.errorText);
  }
});
```

### 在页面里注册工具

在页面里注册工具有两种方式：用 JavaScript 命令式注册，或者用 HTML 表单声明式注册。

#### 命令式注册

```ts
await page.evaluate(async () => {
  await document.modelContext?.registerTool({
    name: 'calculate_sum',
    description: 'Calculates the sum of two numbers',
    inputSchema: {
      type: 'object',
      properties: {
        a: {type: 'number'},
        b: {type: 'number'},
      },
      required: ['a', 'b'],
    },
    execute: ({a, b}) => {
      return a + b;
    },
  });
});
```

#### 声明式注册

WebMCP 也支持把带有特定属性的 HTML 表单识别为工具。

```ts
await page.setContent(`
  <form
    toolname="search_products"
    tooldescription="Search for products in the catalog"
  >
    <input name="query" type="text" />
    <button type="submit">Search</button>
  </form>
`);
```

通过表单注册的工具，可以用 `tool.formElement` 拿到对应的 [`ElementHandle`](https://pptr.dev/api/puppeteer.elementhandle)。

```ts
const tools = page.webmcp.tools();
const searchTool = tools.find(t => t.name === 'search_products');
const formHandle = await searchTool.formElement;
```
