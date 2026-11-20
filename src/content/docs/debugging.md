---
title: 调试
description: 按问题来源选择调试手段：分清服务端代码、客户端代码和浏览器本身，再依次用有头模式、slowMo、console 事件、协议日志和 dumpio 定位问题。
order: 10
category: guides
source: https://pptr.dev/guides/debugging
summary:
  - 问题有三个可能来源：Node 侧、页面侧、浏览器本身
  - 有头模式与 slowMo 是任何场景都该先试的快速自检
  - 协议层用 NODE_DEBUG 与 debugInfo，浏览器层用 dumpio
---

用 Puppeteer 调试可能挺费劲。Puppeteer 会触及浏览器的许多不同组件，比如网络请求和 Web API，所以并不存在某一种“万能”的调试方法。好消息是，Puppeteer 提供了好几种调试方法，基本能覆盖所有可能遇到的问题。

### 背景

一般来说，问题有两个可能的来源：运行在 Node.js 上的代码（我们称之为**服务端代码**），以及[运行在浏览器里的代码](https://pptr.dev/api/puppeteer.page.evaluate)（我们称之为**客户端代码**）。还有第三种可能来源是浏览器本身（我们称之为**内部代码**或**浏览器代码**）。如果你在试过下面的方法之后仍然怀疑问题出在浏览器本身，建议先[搜索已有 issue](https://github.com/puppeteer/puppeteer/issues)，再[提交新 issue](https://github.com/puppeteer/puppeteer/issues/new/choose)。

### 通用调试方法

这些方法可以用来调试任何情况。在深入更复杂的方法之前，应该先用它们快速自检一下。

#### 关闭 [`headless`](https://pptr.dev/api/puppeteer.launchoptions)

有时候，亲眼看看浏览器正在显示什么很有帮助。不要用 [`headless`](https://pptr.dev/api/puppeteer.launchoptions) 模式启动，而是把 [`headless`](https://pptr.dev/api/puppeteer.launchoptions) 设为 `false`，启动完整版本的浏览器：

```ts
const browser = await puppeteer.launch({headless: false});
```

#### Puppeteer 的“慢动作”

[`slowMo`](https://pptr.dev/api/puppeteer.connectoptions) 选项会把 Puppeteer 的操作按指定的毫秒数放慢，这也是观察到底发生了什么的一种办法。

```ts
const browser = await puppeteer.launch({
  headless: false,
  slowMo: 250, // 放慢 250ms
});
```

### 客户端代码的调试方法

#### 捕获 `console.*` 输出

由于客户端代码运行在浏览器里，在客户端代码中调用 `console.*` 不会直接输出到 Node.js。不过你可以监听 [`console`](https://pptr.dev/api/puppeteer.pageevents) 事件（[page.on](https://pptr.dev/api/puppeteer.page)），它会返回一个包含被打印文本的载荷。

```ts
page.on('console', msg => console.log('PAGE LOG:', msg.text()));

await page.evaluate(() => console.log(`url is ${location.href}`));
```

#### 在浏览器里使用 debugger

1. 启动 Puppeteer 时把 [`devtools`](https://pptr.dev/api/puppeteer.launchoptions) 设为 `true`：

   ```ts
   const browser = await puppeteer.launch({devtools: true});
   ```

2. 在你想要调试的客户端代码里加上 `debugger`。例如：

   ```ts
   await page.evaluate(() => {
     debugger;
   });
   ```

   此时浏览器会在 debug 模式下停在找到 `debugger` 关键字的位置。

### 服务端代码的调试方法

#### 在 Node.js 里使用 debugger（仅 Chrome/Chromium）

由于服务端代码和客户端代码交织在一起，这种调试方法与浏览器绑定得很紧密。比如，你可以在服务端脚本里单步跨过 `await page.click()`，同时看到点击在浏览器中发生。

注意，由于这个 [Chromium bug](https://bugs.chromium.org/p/chromium/issues/detail?id=833928)，你没法在 DevTools console 里运行 `await page.click()`。所以如果你想试某个操作，必须把它加到测试文件里。

1. 把 [`headless`](https://pptr.dev/api/puppeteer.launchoptions) 设为 `false`。
2. 在你想要调试的服务端代码里加上 `debugger`。例如：

   ```ts
   debugger;
   await page.click('a[target=_blank]');
   ```

3. 用 `--inspect-brk` 运行你的服务端代码。例如：

   ```bash
   node --inspect-brk path/to/script.js
   ```

4. 在打开的 Chrome/Chromium 浏览器里访问 `chrome://inspect/#devices`，然后点击 `inspect`。
5. 在新打开的测试浏览器里按 `F8` 恢复测试执行。
6. 这时你的 `debugger` 语句就会被命中，你可以在测试浏览器里继续调试。

#### 记录 DevTools 协议流量

如果其他办法都不管用，问题可能出在 Puppeteer 与 DevTools 协议之间。你可以在运行脚本之前设置 `NODE_DEBUG` 环境变量来调试这类问题：它会通过 Node 内置的 [`util.debuglog`](https://nodejs.org/api/util.html#utildebuglogsection-callback) 在 `puppeteer` 命名空间下记录内部通信。

> **警告**
>
> 日志里可能包含敏感信息。

```bash
# 基本的详细日志输出
env NODE_DEBUG="puppeteer:*" node script.js
```

#### 记录待处理的协议调用

如果你遇到 Puppeteer 的异步调用一直没有 resolve 的问题，可以尝试用 [`debugInfo`](https://pptr.dev/api/puppeteer.browser/#properties) 接口记录待处理的回调，看看是哪个调用导致的：

```ts
console.log(browser.debugInfo.pendingProtocolErrors);
```

这个 getter 会返回一组 `Error` 对象，从这些 error 的堆栈可以看出是哪段代码触发了协议调用。

### 浏览器代码的调试方法

#### 打印浏览器日志

如果浏览器意外崩溃或没能正常启动，把启动参数 `dumpio` 设为 `true`、查看浏览器进程的日志可能会有帮助。

```ts
const browser = await puppeteer.launch({
  dumpio: true,
});
```

在这种情况下，Puppeteer 会把浏览器日志转发到 Node 进程的 stdio。
