---
title: 请求拦截
description: 开启请求拦截后每个请求都必须被 continue、respond 或 abort，并讲清多个 handler 并发时的决议检查、Cooperative Intercept Mode 的优先级规则以及包维护者的升级方式。
order: 11
category: guides
source: https://pptr.dev/guides/network-interception
summary:
  - 拦截开启后请求会停滞，直到被 continue、respond 或 abort
  - 多个 handler 并发时，必须同步检查决议状态再操作
  - Cooperative Intercept Mode 按 priority 投票，平票时 abort > respond > continue，包维护者可导出 setInterceptResolutionConfig() 平滑升级
---

一旦开启请求拦截，每个请求都会停滞，直到它被 continue、respond 或 abort。

下面是一个简单的请求拦截器例子，它会中止所有图片请求：

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on('request', interceptedRequest => {
  if (interceptedRequest.isInterceptResolutionHandled()) return;
  if (
    interceptedRequest.url().endsWith('.png') ||
    interceptedRequest.url().endsWith('.jpg')
  )
    interceptedRequest.abort();
  else interceptedRequest.continue();
});
await page.goto('https://example.com');
await browser.close();
```

### 多个拦截处理器与异步决议

默认情况下，如果在 `request.abort`、`request.continue` 或 `request.respond` 中的某一个已经被调用之后再调用它们，Puppeteer 会抛出 `Request is already handled!` 异常。

要始终假定某个你不了解的 handler 可能已经调用过 `abort/continue/respond`。即便你注册的只有自己那一个 handler，第三方包也可能注册它们的 handler。所以在调用 `abort/continue/respond` 之前，务必先用 [request.isInterceptResolutionHandled](https://pptr.dev/api/puppeteer.httprequest.isinterceptresolutionhandled) 检查决议状态。

更重要的是，在你的 handler 正在等待某个异步操作时，拦截决议可能已经被另一个 listener 处理掉了。因此 `request.isInterceptResolutionHandled` 的返回值只在同步代码块里是可靠的。务必把 `request.isInterceptResolutionHandled` 和 `abort/continue/respond` **同步地**放在一起执行。

下面这个例子演示两个同步 handler 如何协作：

```ts
/*
第一个 handler 会成功调用 request.continue，因为这个请求的拦截从来没有被决议过。
*/
page.on('request', interceptedRequest => {
  if (interceptedRequest.isInterceptResolutionHandled()) return;
  interceptedRequest.continue();
});

/*
第二个 handler 会在调用 request.abort 之前就返回，因为第一个 handler 已经调用过 request.continue 了。
*/
page.on('request', interceptedRequest => {
  if (interceptedRequest.isInterceptResolutionHandled()) return;
  interceptedRequest.abort();
});
```

下面这个例子演示异步 handler 如何协作：

```ts
/*
第一个 handler 会成功调用 request.continue，因为这个请求的拦截从来没有被决议过。
*/
page.on('request', interceptedRequest => {
  // 拦截还没有被处理，控制流会穿过这个检查。
  if (interceptedRequest.isInterceptResolutionHandled()) return;

  // 并不一定要返回一个 promise，但这样 Puppeteer 才能 await 这个 handler。
  return new Promise(resolve => {
    // 500ms 之后 continue
    setTimeout(() => {
      // 在回调里同步检查一次，确认拦截还没有被处理。
      // 在这 500ms 里，另一个 handler 可能正在 await 它自己的异步操作，拦截可能已经被处理掉了。
      if (interceptedRequest.isInterceptResolutionHandled()) {
        resolve();
        return;
      }
      interceptedRequest.continue();
      resolve();
    }, 500);
  });
});
page.on('request', async interceptedRequest => {
  // 拦截还没有被处理，控制流会穿过这个检查。
  if (interceptedRequest.isInterceptResolutionHandled()) return;

  await someLongAsyncOperation();
  // 拦截*有可能*已经被第一个 handler 处理了，我们无法确定。
  // 因此，在调用 continue() 之前必须再检查一次，否则就有可能被 Puppeteer 抛出异常。
  if (interceptedRequest.isInterceptResolutionHandled()) return;
  interceptedRequest.continue();
});
```

想要更细粒度的观察（见下文的 Cooperative Intercept Mode），你也可以在使用 `abort/continue/respond` 之前同步调用 [request.interceptResolutionState](https://pptr.dev/api/puppeteer.httprequest.interceptresolutionstate)。

下面把上面的例子改写成使用 `request.interceptResolutionState` 的版本：

```ts
/*
第一个 handler 会成功调用 request.continue，因为这个请求的拦截从来没有被决议过。
*/
page.on('request', interceptedRequest => {
  // 拦截还没有被处理，控制流会穿过这个检查。
  const {action} = interceptedRequest.interceptResolutionState();
  if (action === InterceptResolutionAction.AlreadyHandled) return;

  // 并不一定要返回一个 promise，但这样 Puppeteer 才能 await 这个 handler。
  return new Promise(resolve => {
    // 500ms 之后 continue
    setTimeout(() => {
      // 在回调里同步检查一次，确认拦截还没有被处理。
      // 在这 500ms 里，另一个 handler 可能正在 await 它自己的异步操作，拦截可能已经被处理掉了。
      const {action} = interceptedRequest.interceptResolutionState();
      if (action === InterceptResolutionAction.AlreadyHandled) {
        resolve();
        return;
      }
      interceptedRequest.continue();
      resolve();
    }, 500);
  });
});
page.on('request', async interceptedRequest => {
  // 拦截还没有被处理，控制流会穿过这个检查。
  if (
    interceptedRequest.interceptResolutionState().action ===
    InterceptResolutionAction.AlreadyHandled
  )
    return;

  await someLongAsyncOperation();
  // 拦截*有可能*已经被第一个 handler 处理了，我们无法确定。
  // 因此，在调用 continue() 之前必须再检查一次，否则就有可能被 Puppeteer 抛出异常。
  if (
    interceptedRequest.interceptResolutionState().action ===
    InterceptResolutionAction.AlreadyHandled
  )
    return;
  interceptedRequest.continue();
});
```

### Cooperative Intercept Mode（协作式拦截模式）

`request.abort`、`request.continue` 和 `request.respond` 都接受一个可选的 `priority` 参数，用于进入 Cooperative Intercept Mode。当所有 handler 都使用 Cooperative Intercept Mode 时，Puppeteer 保证所有拦截 handler 都会按注册顺序运行并被 await。拦截最终会解析为优先级最高的那个决议。Cooperative Intercept Mode 的规则如下：

- 所有决议都必须给 `abort/continue/respond` 传入数字的 `priority` 参数。
- 只要有任何一个决议没有传数字 `priority`，就启用 Legacy Mode，Cooperative Intercept Mode 失效。
- 异步 handler 会在拦截决议最终确定之前完成。
- 优先级最高的拦截决议“获胜”，也就是说，拦截最终按优先级最高的那个决议来 abort/respond/continue。
- 出现平票时，`abort` > `respond` > `continue`。
- `continue` 的覆盖参数、`respond` 的响应、`abort` 的错误码，各自取自该类调用中优先级最高的那一次；如果同一优先级上有多次同类调用，则取其中最新的一次。

为了统一约定，除非你有明确理由使用更高的优先级，否则在指定 Cooperative Intercept Mode 的优先级时，请使用 `0` 或 `DEFAULT_INTERCEPT_RESOLUTION_PRIORITY`（由 `HTTPRequest` 导出）。这样会温和地让 `respond` 优先于 `continue`、`abort` 优先于 `respond`，也让其他 handler 能够协作工作。如果你确实想用别的优先级，那么高优先级会赢过低优先级，负数优先级也是允许的。例如 `continue({}, 4)` 会赢过 `continue({}, -2)`。

为了保持向后兼容，任何不指定 `priority` 就决议拦截的 handler（Legacy Mode）都会导致立即决议。要让 Cooperative Intercept Mode 生效，所有决议都必须使用 `priority`。实际上，这意味着你仍然必须检查 `request.isInterceptResolutionHandled`，因为你控制不了的某个 handler 可能调用了不带 priority 的 `abort/continue/respond`（Legacy Mode）。

在这个例子里，Legacy Mode 占上风，请求被立即中止，因为至少有一个 handler 在决议拦截时省略了 `priority`：

```ts
// 最终结果：立即 abort()
page.setRequestInterception(true);
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Legacy Mode：拦截被立即 abort。
  request.abort('failed');
});
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;
  // 控制流永远到不了这里，因为在 Legacy Mode 下请求已经被 abort 了

  // Cooperative Intercept Mode：以优先级 0 投 continue 一票。
  request.continue({}, 0);
});
```

在这个例子里，Legacy Mode 占上风，请求被继续，因为至少有一个 handler 没有指定 `priority`：

```ts
// 最终结果：立即 continue()
page.setRequestInterception(true);
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Cooperative Intercept Mode：以优先级 0 投 abort 一票。
  request.abort('failed', 0);
});
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // 控制流会走到这里，因为请求是协作式 abort 的，决议被推迟了。

  // { action: InterceptResolutionAction.Abort, priority: 0 }，因为 abort @ 0 是当前胜出的决议
  console.log(request.interceptResolutionState());

  // Legacy Mode：拦截立即 continue。
  request.continue({});
});
page.on('request', request => {
  // { action: InterceptResolutionAction.AlreadyHandled }，因为已经调用过 Legacy Mode 的 continue
  console.log(request.interceptResolutionState());
});
```

在这个例子里，Cooperative Intercept Mode 处于生效状态，因为所有 handler 都指定了 `priority`。`continue()` 获胜，它的优先级比 `abort()` 更高。

```ts
// 最终结果：协作式 continue() @ 5
page.setRequestInterception(true);
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Cooperative Intercept Mode：以优先级 10 投 abort 一票
  request.abort('failed', 0);
});
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Cooperative Intercept Mode：以优先级 5 投 continue 一票
  request.continue(request.continueRequestOverrides(), 5);
});
page.on('request', request => {
  // { action: InterceptResolutionAction.Continue, priority: 5 }，因为 continue @ 5 > abort @ 0
  console.log(request.interceptResolutionState());
});
```

在这个例子里，Cooperative Intercept Mode 处于生效状态，因为所有 handler 都指定了 `priority`。`respond()` 获胜，它的优先级与 `continue()` 打平，但 `respond()` 胜过 `continue()`。

```ts
// 最终结果：协作式 respond() @ 15
page.setRequestInterception(true);
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Cooperative Intercept Mode：以优先级 10 投 abort 一票
  request.abort('failed', 10);
});
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Cooperative Intercept Mode：以优先级 15 投 continue 一票
  request.continue(request.continueRequestOverrides(), 15);
});
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Cooperative Intercept Mode：以优先级 15 投 respond 一票
  request.respond(request.responseForRequest(), 15);
});
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Cooperative Intercept Mode：以优先级 12 投 respond 一票
  request.respond(request.responseForRequest(), 12);
});
page.on('request', request => {
  // { action: InterceptResolutionAction.Respond, priority: 15 }，因为 respond @ 15 > continue @ 15 > respond @ 12 > abort @ 10
  console.log(request.interceptResolutionState());
});
```

### Cooperative Request Continuation（协作式请求继续）

Puppeteer 要求显式调用 `request.continue()`，否则请求会一直挂起。即使你的 handler 不打算做任何特殊处理、想“退出”（opt out），也必须调用 `request.continue()`。

随着 Cooperative Intercept Mode 的引入，协作式请求继续出现了两种使用场景：Unopinionated（无主张）和 Opinionated（有主张）。

第一种（常见）是你的 handler 并不打算对这个请求做任何特殊处理。它对后续动作没有任何主张，只是默认继续，和/或把决定权让给那些可能有主张的其他 handler。但如果根本没有其他 handler，我们就必须调用 `request.continue()`，确保请求不会挂起。

我们把这称为 **Unopinionated continuation**（无主张的继续），因为它的意图是：如果没有别人有更好的主意，就继续这个请求。这类 continue 请使用 `request.continue({...}, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY)`（或 `0`）。

第二种（不常见）是你的 handler 确实有自己的主张，想要强制 continue，去覆盖别处发起的低优先级 `abort()` 或 `respond()`。我们把这称为 **Opinionated continuation**（有主张的继续）。在你确实需要指定一个覆盖式 continue 优先级的少见场景里，使用自定义优先级。

概括一下：请想清楚你使用 `request.continue` 究竟只是默认/放行行为，还是落在 handler 预期用途之内。属于预期用途之内时可以考虑使用自定义优先级，否则使用默认优先级。另外要注意，同一个 handler 可能同时存在 Opinionated 和 Unopinionated 两种情况。

### 给包维护者：升级到 Cooperative Intercept Mode

如果你是包维护者，并且你的包用到了拦截 handler，你可以把 handler 升级为使用 Cooperative Intercept Mode。假设你现有的 handler 如下：

```ts
page.on('request', interceptedRequest => {
  if (request.isInterceptResolutionHandled()) return;
  if (
    interceptedRequest.url().endsWith('.png') ||
    interceptedRequest.url().endsWith('.jpg')
  )
    interceptedRequest.abort();
  else interceptedRequest.continue();
});
```

要使用 Cooperative Intercept Mode，就升级 `continue()` 和 `abort()`：

```ts
page.on('request', interceptedRequest => {
  if (request.isInterceptResolutionHandled()) return;
  if (
    interceptedRequest.url().endsWith('.png') ||
    interceptedRequest.url().endsWith('.jpg')
  )
    interceptedRequest.abort('failed', 0);
  else
    interceptedRequest.continue(
      interceptedRequest.continueRequestOverrides(),
      0,
    );
});
```

这样简单升级之后，你的 handler 就改用 Cooperative Intercept Mode 了。

不过我们建议一个稍微更稳妥的方案，因为上面的做法会带来几个微妙的问题：

1. **向后兼容。** 如果还有任何 handler 使用 Legacy Mode 的决议（也就是不指定 priority），那么即使你的 handler 先运行，它也会把拦截立即决议掉。这对你的用户来说可能是很别扭的行为：用户明明只是升级了你的包，你的 handler 却突然不再决议拦截，而是让别的 handler 占了先。
2. **硬编码优先级。** 你的包的用户无法为你的 handler 指定默认决议优先级。当用户想根据场景调整优先级时，这一点会变得重要。例如，一个用户可能希望你的包优先级很高，而另一个用户希望它优先级很低。

要同时解决这两个问题，我们推荐的方案是由你的包导出一个 `setInterceptResolutionConfig()`。用户就可以调用 `setInterceptResolutionConfig()` 显式地在你的包里启用 Cooperative Intercept Mode，从而不会被拦截决议方式的变化打个措手不及。他们还可以选择通过 `setInterceptResolutionConfig(priority)` 指定适合自己场景的自定义优先级：

```ts
// 默认为 undefined，从而保留 Legacy Mode 行为
let _priority = undefined;

// 导出一个模块配置函数
export const setInterceptResolutionConfig = (priority = 0) =>
  (_priority = priority);

/**
 * 注意，这个 handler 使用 DEFAULT_INTERCEPT_RESOLUTION_PRIORITY 来对这个请求“弃权”。
 * 当你的 handler 对请求没有主张、意图是默认 continue() 时，使用默认优先级很重要。
 */
page.on('request', interceptedRequest => {
  if (request.isInterceptResolutionHandled()) return;
  if (
    interceptedRequest.url().endsWith('.png') ||
    interceptedRequest.url().endsWith('.jpg')
  )
    interceptedRequest.abort('failed', _priority);
  else
    interceptedRequest.continue(
      interceptedRequest.continueRequestOverrides(),
      DEFAULT_INTERCEPT_RESOLUTION_PRIORITY, // 无主张的继续
    );
});
```

如果你的包需要对决议优先级有更细粒度的控制，可以用下面这种 config 模式：

```ts
interface InterceptResolutionConfig {
  abortPriority?: number;
  continuePriority?: number;
}

// 这种方式可以根据不同场景支持多个优先级。
// 例如，你可以做一个 config，
// 让 PNG 和 JPG 使用各自不同的优先级。
const DEFAULT_CONFIG: InterceptResolutionConfig = {
  abortPriority: undefined, // 默认使用 Legacy Mode
  continuePriority: undefined, // 默认使用 Legacy Mode
};

// 默认为 undefined，从而保留 Legacy Mode 行为
let _config: Partial<InterceptResolutionConfig> = {};

export const setInterceptResolutionConfig = (
  config: InterceptResolutionConfig,
) => (_config = {...DEFAULT_CONFIG, ...config});

page.on('request', interceptedRequest => {
  if (request.isInterceptResolutionHandled()) return;
  if (
    interceptedRequest.url().endsWith('.png') ||
    interceptedRequest.url().endsWith('.jpg')
  ) {
    interceptedRequest.abort('failed', _config.abortPriority);
  } else {
    // 这里我们使用自定义配置的优先级，以便允许有主张的
    // 继续（Opinionated continuation）。
    // 只有当我们有非常明确的理由说明某些场景需要有主张的继续时，
    // 才应该开放这种用法。
    interceptedRequest.continue(
      interceptedRequest.continueRequestOverrides(),
      _config.continuePriority, // 这里什么时候会希望 priority!==0？
    );
  }
});
```

上面的方案在保证向后兼容的同时，也允许用户在启用 Cooperative Intercept Mode 时调整你的包在决议链中的重要程度。在用户把自己的代码和所有第三方包都完全升级到 Cooperative Intercept Mode 之前，你的包仍能照常工作。只要还有任何 handler 或包使用 Legacy Mode，你的包也仍然可以在 Legacy Mode 下运行。
