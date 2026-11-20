---
title: 配置
description: 用配置文件或环境变量自定义 Puppeteer 的默认行为，包括浏览器下载选项、缓存目录、代理与自定义证书。
order: 9
category: guides
source: https://pptr.dev/guides/configuration
summary:
  - 配置文件与环境变量两种自定义方式，以及谁覆盖谁
  - 改动下载选项后必须重新跑一次安装脚本
  - 只能用环境变量设置的选项：代理与自定义证书
---

默认情况下，Puppeteer 会下载并使用特定版本的 Chrome，以保证它的 API 开箱即用。如果你想让 Puppeteer 使用其他版本的 Chrome 或 Chromium，可以在创建 `Browser` 实例时传入可执行文件的路径：

```ts
const browser = await puppeteer.launch({executablePath: '/path/to/Chrome'});
```

Puppeteer 也可以搭配 Firefox 使用。更多信息见[跨浏览器支持的现状](/faq#cross-browser)。

Puppeteer 的所有默认值都可以通过两种方式自定义：

1. [配置文件](#配置文件)（**推荐**）
2. [环境变量](#环境变量)

> **注意**
>
> 有些选项只能通过环境变量来配置（例如 `HTTPS_PROXY`）。

> **注意**
>
> `puppeteer-core` 会忽略 Puppeteer 的配置文件和环境变量。

### 配置文件

配置文件是配置 Puppeteer 的**推荐**方式。Puppeteer 会沿着目录树向上查找，匹配以下任意一种格式：

- `package.json`
- `.config/puppeteer.config.cjs`
- `.config/puppeteer.config.js`
- `.config/puppeteerrc.cjs`
- `.config/puppeteerrc.js`
- `.config/puppeteerrc.json`
- `.config/puppeteerrc`（JSON）
- `.puppeteerrc.cjs`
- `.puppeteerrc.js`
- `.puppeteerrc.json`
- `.puppeteerrc`（JSON）
- `puppeteer.config.cjs`
- `puppeteer.config.js`

可用的选项见 [`Configuration`](https://pptr.dev/api/puppeteer.configuration) 接口。

#### 修改下载选项

如果配置改动涉及下载选项，你需要重新执行一次 postinstall 脚本，改动才会生效。

最省事的办法是运行：

```bash
npx puppeteer browsers install
```

#### 示例

##### 下载多个浏览器

从 v23.0.0 开始，Puppeteer 支持一次性下载多个浏览器，不必重复执行多条命令。

更新 Puppeteer 配置文件：

```js title="project-directory/.puppeteerrc.js"
/**
 * @type {import("puppeteer").Configuration}
 */
export default {
  // 下载 Chrome（默认 `skipDownload: false`）。
  chrome: {
    skipDownload: false,
  },
  // 下载 Firefox（默认 `skipDownload: true`）。
  firefox: {
    skipDownload: false,
  },
};
```

运行 CLI 下载新配置：

```bash
npx puppeteer browsers install
```

##### 修改默认缓存目录

从 v19.0.0 开始，Puppeteer 把浏览器存放在 `~/.cache/puppeteer`，以便在安装之间全局缓存浏览器。如果在某个构建步骤里把 `puppeteer` 打包（pack）后移动到了新位置，这就可能引发问题。下面这份配置可以解决这个问题（重新安装 `puppeteer` 后生效）：

```js title="project-directory/.puppeteerrc.js"
import {join} from 'path';

/**
 * @type {import("puppeteer").Configuration}
 */
export default {
  // 修改 Puppeteer 的缓存位置。
  cacheDirectory: join(import.meta.dirname, '.cache', 'puppeteer'),
};
```

### 环境变量

除了配置文件，Puppeteer 还会查找某些[环境变量](https://en.wikipedia.org/wiki/Environment_variable)来自定义行为。只要适用，环境变量总会覆盖配置文件里的选项。

下面这些选项**只能通过环境变量**设置：

- `HTTP_PROXY`、`HTTPS_PROXY`、`NO_PROXY` —— 定义下载和运行浏览器时使用的 HTTP 代理设置。

> **说明**
>
> 想通过代理下载浏览器，你必须把 `proxy-agent` 包作为可选的 peer dependency 安装好。

其余选项都可以在 [`Configuration`](https://pptr.dev/api/puppeteer.configuration) 接口的文档里找到。

#### 自定义证书

浏览器是使用 Node.js 的 HTTPS 客户端下载的，因此标准的 Node.js TLS 环境变量都会起作用。当下载要经过使用自定义证书颁发机构（CA）的公司代理或镜像时，这一点很有用：

- `NODE_EXTRA_CA_CERTS` —— 指向一个 PEM 文件的路径，里面是额外需要信任的 CA 证书，例如 `NODE_EXTRA_CA_CERTS=/path/to/ca.pem npm install puppeteer`。
- `NODE_TLS_REJECT_UNAUTHORIZED=0` —— 完全关闭证书校验。这不安全，只应作为最后的手段。

> **说明**
>
> 默认情况下，Node.js 不会读取 `SSL_CERT_FILE` 和 `SSL_CERT_DIR`，所以设置它们对浏览器下载没有任何影响。
