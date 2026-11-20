---
title: 故障排查
description: Puppeteer 常见报错与平台问题的排查手册：找不到浏览器、安装脚本被拦截、Linux/Windows 沙箱配置，以及各 CI、Docker 与云平台上的运行要点。
order: 27
category: community
source: https://pptr.dev/troubleshooting
summary:
  - 安装与浏览器相关的常见报错及绕过方式
  - Windows 与 Linux 上的沙箱、依赖配置
  - CI、Docker 与各云平台上的运行要点
---

> **说明**
>
> 为了让本页保持最新，我们主要依靠社区贡献。
> 如果你发现某些内容已经过时，欢迎提一个 PR。

### `Cannot find module 'puppeteer-core/internal/...'`

出现这个报错，可能是因为你的 Node.js 版本低于 14，或者你使用了自定义的解析器（例如
[`jest-resolve`](https://www.npmjs.com/package/jest-resolve)）。对于前者，我们不支持已经废弃的 Node.js 版本。对于后者，通常升级解析器（或者它的上层模块，比如 `jest`）就能解决（例如
https://github.com/puppeteer/puppeteer/issues/9121 ）。

### `Could not find expected browser locally`

从 v19.0.0 开始，Puppeteer 会借助
[`os.homedir`](https://nodejs.org/api/os.html#oshomedir) 把浏览器下载到 `~/.cache/puppeteer`，以便在 Puppeteer 升级之间更好地做缓存。一般来说主目录都有明确定义（即使在 Windows 上），但偶尔主目录可能不可用。这种情况下，我们提供 `PUPPETEER_CACHE_DIR` 变量，让你可以改变安装目录。

例如：

```bash
PUPPETEER_CACHE_DIR=$(pwd) npm install puppeteer
PUPPETEER_CACHE_DIR=$(pwd) node <script-path>
```

你也可以在应用根目录创建一个名为 `.puppeteerrc.js`（或 `puppeteer.config.js`）的配置文件，内容如下：

```js
import {join} from 'path';

/**
 * @type {import("puppeteer").Configuration}
 */
export default {
  cacheDirectory: join(import.meta.dirname, '.cache', 'puppeteer'),
};
```

需要重新安装 `puppeteer`，配置才会生效。更多信息见 [配置 Puppeteer](/docs/configuration)。

#### 安装脚本被拦截

如果你使用的包管理器默认会拦截依赖的安装脚本（例如遵循新 [RFC](https://github.com/npm/rfcs/pull/868) 的 npm、pnpm、Yarn Berry、Bun 或 Deno），那么负责自动下载浏览器的 postinstall 脚本就不会执行。

要手动下载所需的浏览器，运行：

```bash
npx puppeteer browsers install
```

或者，你可以重新允许执行 postinstall 脚本，方法是在项目的 `package.json` 里做配置（以 npm 为例）：

```json
{
  "allowScripts": {
    "puppeteer": true
  }
}
```

### 在 Chrome 中访问 HTTP 网址时报 `net::ERR_BLOCKED_BY_CLIENT`

Chrome 正在推出一项名为 `HttpsFirstBalancedModeAutoEnable` 的功能，当用户访问 HTTP 站点时向用户展示警告。在 Puppeteer 默认使用的 Chrome for Testing 构建里，这项功能是默认开启的。

这项功能会让访问 HTTP URL 的导航请求产生 `net::ERR_BLOCKED_BY_CLIENT` 错误，该错误可以被捕获并从中恢复。错误发生时，会向用户展示一个带有继续导航按钮的警告页面，这个按钮可以通过 Puppeteer 点击。本地 HTTP 主机不会触发警告，但远程主机可能会。更多细节见
https://crbug.com/378022921

可以在启动 Chrome 时传入 `--disable-features=HttpsFirstBalancedModeAutoEnable` 参数来禁用这个 Chrome 特性：

```ts
const browser = await puppeteer.launch({
  args: ['--disable-features=HttpsFirstBalancedModeAutoEnable'],
});
```

### Chrome 在 Windows 上无法启动

某些 [Chrome 策略](https://support.google.com/chrome/a/answer/7532015) 可能强制要求 Chrome/Chromium 带着特定扩展运行。

Puppeteer 默认会传入 `--disable-extensions` 标志，因此在这类策略生效时会启动失败。

要绕过这个问题，请设置 `enableExtensions` 选项：

```ts
const browser = await puppeteer.launch({
  enableExtensions: true,
});
```

> 背景：
> [issue 3681](https://github.com/puppeteer/puppeteer/issues/3681#issuecomment-447865342)。

### Chrome 在 Windows 上报沙箱错误

Chrome 在 Windows 上使用沙箱，这需要对下载下来的 Chrome 文件授予额外权限。从 Puppeteer v22.14.0 开始，Puppeteer 会在安装浏览器时尝试运行 Chrome 自带的 `setup.exe` 工具来配置这些权限。

如果你用的是更早的 Puppeteer 版本，或者仍然在浏览器输出里看到下面这个错误：

```
[24452:59820:0508/113713.058:ERROR:sandbox_win.cc(913)] Sandbox cannot access executable. Check filesystem permissions are valid. See https://bit.ly/31yqMJR.: Access is denied. (0x5)
```

你可以用 icacls 手动设置权限：

```powershell
icacls "%USERPROFILE%/.cache/puppeteer/chrome" /grant *S-1-15-2-1:(OI)(CI)(RX)
```

> **说明**
>
> 在高安全要求的环境中，应当使用限制更严格的 SID，例如
> [installer](https://source.chromium.org/chromium/chromium/src/+/main:chrome/installer/setup/install_worker.cc;l=74)
> 里给出的那个。

更多细节见 [Chromium LPAC 文件系统权限文档](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/design/sandbox.md#lpac-file-system-permissions)。

### Chrome 在 Linux 上无法启动

确保所有必要的依赖都已安装。你可以在 Linux 机器上运行 `ldd chrome
| grep not` 来检查缺少哪些依赖。常见的依赖列在下面。另外，
https://source.chromium.org/chromium/chromium/src/+/main:chrome/installer/linux/debian/dist_package_versions.json
上有 Chrome 安装器声明的最新依赖清单。

#### Debian（例如 Ubuntu）依赖

```
ca-certificates
fonts-liberation
libasound2
libatk-bridge2.0-0
libatk1.0-0
libc6
libcairo2
libcups2
libdbus-1-3
libexpat1
libfontconfig1
libgbm1
libgcc1
libglib2.0-0
libgtk-3-0
libnspr4
libnss3
libpango-1.0-0
libpangocairo-1.0-0
libstdc++6
libx11-6
libx11-xcb1
libxcb1
libxcomposite1
libxcursor1
libxdamage1
libxext6
libxfixes3
libxi6
libxrandr2
libxrender1
libxss1
libxtst6
lsb-release
wget
xdg-utils
```

#### CentOS 依赖

```
alsa-lib.x86_64
atk.x86_64
cups-libs.x86_64
gtk3.x86_64
ipa-gothic-fonts
libXcomposite.x86_64
libXcursor.x86_64
libXdamage.x86_64
libXext.x86_64
libXi.x86_64
libXrandr.x86_64
libXScrnSaver.x86_64
libXtst.x86_64
pango.x86_64
xorg-x11-fonts-100dpi
xorg-x11-fonts-75dpi
xorg-x11-fonts-cyrillic
xorg-x11-fonts-misc
xorg-x11-fonts-Type1
xorg-x11-utils
```

安装完依赖之后，你需要用下面这条命令更新 `nss` 库：

```
yum update nss -y
```

#### 相关讨论

- [#290](https://github.com/puppeteer/puppeteer/issues/290) - Debian 排查
- [#391](https://github.com/puppeteer/puppeteer/issues/391) - CentOS 排查
- [#379](https://github.com/puppeteer/puppeteer/issues/379) - Alpine 排查

### chrome-headless-shell 会禁用 GPU 合成

chrome-headless-shell 需要 `--enable-gpu`
才能[在无头模式下启用 GPU 加速](https://crbug.com/1416283)。

```ts
const browser = await puppeteer.launch({
  headless: 'shell',
  args: ['--enable-gpu'],
});
```

### 为 Chrome 配置 GPU

一般来说，只要系统装有合适的驱动，Chrome 就能自行检测并启用 GPU。更多技巧可以参考这篇博客
https://developer.chrome.com/blog/supercharge-web-ai-testing 。

### 配置 Chrome 的 Linux 沙箱

为了保护宿主环境不受不可信网页内容的影响，Chrome 使用了
[多层沙箱](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/design/sandbox.md)。
要让它正常工作，宿主环境必须先完成配置。如果没有可供 Chrome 使用的沙箱，它会崩溃并报错
`No usable sandbox!`。

如果你**完全信任**在 Chrome 里打开的内容，可以用 `--no-sandbox` 参数启动 Chrome：

```ts
const browser = await puppeteer.launch({
  args: ['--no-sandbox'],
});
```

> **注意**
>
> **强烈不建议**在没有沙箱的情况下运行。请考虑配置好沙箱再运行。

**推荐的做法是使用沙箱来运行 Chrome**

#### Ubuntu 上的 AppArmor 问题

Ubuntu 23.10+（将来可能还有其他 Linux 发行版）自带一条 AppArmor 规则，它作用于安装在
`/opt/google/chrome/chrome`（默认安装路径）的 Chrome stable 二进制，这条策略存放在
`/etc/apparmor.d/chrome`。这条 AppArmor 策略使 Puppeteer 下载的 Chrome for Testing 二进制无法使用 user namespaces，从而在尝试启动浏览器时报 `No usable sandbox!` 错误。

绕过办法见 [https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md](https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md)。

#### 使用 [setuid sandbox](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/linux/suid_sandbox_development.md)

> **注意**
>
> 重要提示：Linux SUID sandbox 已经基本被移除，但还没有完全清理干净。见 https://bugs.chromium.org/p/chromium/issues/detail?id=598454 本节内容大部分已经过时。

setuid sandbox 是一个独立的可执行文件，位于 Puppeteer 下载的 Chrome 旁边。不同 Chrome 版本复用同一个 sandbox 可执行文件是没问题的，因此下面这些操作每台宿主环境只需做一次：

```bash
# cd 到 Puppeteer 缓存目录（如果你用了别的缓存目录，请调整路径）。
cd ~/.cache/puppeteer/chrome/linux-<version>/chrome-linux64/
sudo chown root:root chrome_sandbox
sudo chmod 4755 chrome_sandbox
# 把 sandbox 可执行文件复制到一个共享位置
sudo cp -p chrome_sandbox /usr/local/sbin/chrome-devel-sandbox
# 导出 CHROME_DEVEL_SANDBOX 环境变量
export CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox
```

你可能希望默认就导出 `CHROME_DEVEL_SANDBOX` 环境变量。这种情况下，把下面这行加到 `~/.bashrc` 或 `.zshenv` 里：

```bash
export CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox
```

或者加到你的 `Dockerfile` 里：

```
ENV CHROME_DEVEL_SANDBOX /usr/local/sbin/chrome-devel-sandbox
```

### 在 Travis CI 上运行 Puppeteer

> 在 v6.0.0 之前（那时我们迁移到了 GitHub Actions），我们的 Puppeteer 测试是跑在 Travis CI 上的——可参考历史版本的
> [`.travis.yml` (v5.5.0)](https://github.com/puppeteer/puppeteer/blob/v5.5.0/.travis.yml)。

小贴士：

- 要以非无头模式运行 Chrome for Testing，需要启动 [xvfb](https://en.wikipedia.org/wiki/Xvfb) 服务
- 在 Travis 上默认运行于 Xenial Linux
- 默认会执行 `npm install`
- `node_modules` 默认会被缓存

`.travis.yml` 大概长这样：

```yml
language: node_js
node_js: node
services: xvfb
script:
  - npm test
```

### 在 WSL（Windows 的 Linux 子系统）上运行 Puppeteer

看看[这个讨论](https://github.com/puppeteer/puppeteer/issues/1837)，里面有一些 WSL 专属的技巧。简单地说，你需要通过下面两种方式之一补齐缺失的依赖：

1. [在 WSL 上安装 Chrome，从而把所有依赖装上](https://learn.microsoft.com/en-us/windows/wsl/tutorials/gui-apps#install-google-chrome-for-linux)
2. 手动安装所需依赖：
   `sudo apt install libgtk-3-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2`。

> **注意**
>
> 所需依赖的列表可能会过时，而且取决于你系统上已经装了什么。

### 在 CircleCI 上运行 Puppeteer

要在 CircleCI 上顺畅地运行 Puppeteer，需要以下几步：

1. 在配置里从
   [NodeJS image](https://circleci.com/docs/guides/execute/circleci-images/) 开始，像这样：
   ```yaml
   docker:
     - image: circleci/node:14 # 用你想要的版本
       environment:
         NODE_ENV: development # 只有把 puppeteer 放在 `devDependencies` 里时才需要
   ```
1. `libXtst6` 这类依赖大概需要用 `apt-get` 来安装，所以可以使用
   [threetreeslight/puppeteer](https://circleci.com/developer/orbs/orb/threetreeslight/puppeteer) orb
   （[操作说明](https://circleci.com/developer/orbs/orb/threetreeslight/puppeteer)），
   或者把它的
   [源代码](https://circleci.com/developer/orbs/orb/threetreeslight/puppeteer)
   中的一部分贴到你自己的配置里。
1. 最后，如果你是通过 Jest 使用 Puppeteer，可能会遇到启动子进程时的报错：
   ```
   [00:00.0]  jest args: --e2e --spec --max-workers=36
   Error: spawn ENOMEM
      at ChildProcess.spawn (internal/child_process.js:394:11)
   ```
   这很可能是因为 Jest 自动探测的是整台机器上的进程数（`36`），而不是你的容器可用的进程数（`2`）。
   要修复这个问题，请在测试命令里设置 `jest --maxWorkers=2`。

### 在 Docker 中运行 Puppeteer

> 在 v3.0.x 之前，我们用 [Cirrus Ci](https://cirrus-ci.org/) 在 Docker 容器里跑 Puppeteer 的测试——可参考历史版本的
> [`Dockerfile.linux` (v3.0.1)](https://github.com/puppeteer/puppeteer/blob/v3.0.1/.ci/node12/Dockerfile.linux)。
> 从 v16.0.0 开始，我们通过 GitHub registry 提供 Docker 镜像。Dockerfile 在
> [这里](https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile)，
> 用法说明见 [Integrations > Docker](/docs/docker)。
> 如果你要自己构建镜像，下面的步骤仍然有用。

让无头 Chrome 在 Docker 里跑起来可能有点折腾。Puppeteer 安装的自带 Chrome for Testing 缺少必要的共享库依赖。

要解决这个问题，你需要在 Dockerfile 里安装缺失的依赖以及最新的 Chrome for Testing 包：

```Dockerfile
FROM node:14-slim

# 安装最新的 chrome dev 包以及字体，以支持主要字符集（中文、日文、阿拉伯文、希伯来文、泰文等）
# 注意：这会装上必要的库，让 Puppeteer 安装的自带 Chrome for Testing
# 版本能正常工作。
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 如果使用 Docker >= 1.13.0，请用 docker run 的 --init 参数来回收僵尸进程；否则
# 取消下面几行的注释，让 `dumb-init` 作为 PID 1
# ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_x86_64 /usr/local/bin/dumb-init
# RUN chmod +x /usr/local/bin/dumb-init
# ENTRYPOINT ["dumb-init", "--"]

# 取消注释可以在安装 puppeteer 时跳过下载 Chrome for Testing。如果你这么做，
# 启动 puppeteer 时需要写成：
#     browser.launch({executablePath: 'google-chrome-stable'})
# ENV PUPPETEER_SKIP_DOWNLOAD true

# 安装 puppeteer，让容器里可用。
RUN npm init -y &&  \
    npm i puppeteer \
    # 添加用户，这样我们就不需要 --no-sandbox。
    # 和 npm install 放在同一层，避免重新 chown 过的文件多用掉几百 MB 空间
    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /node_modules \
    && chown -R pptruser:pptruser /package.json \
    && chown -R pptruser:pptruser /package-lock.json

# 之后的所有操作都以非特权用户身份运行。
USER pptruser

CMD ["google-chrome-stable"]
```

构建镜像：

```bash
docker build -t puppeteer-chrome-linux .
```

把 `node -e "<yourscript.js content as a string>"` 作为命令传入来运行容器：

```bash
 docker run -i --init --rm --cap-add=SYS_ADMIN \
   --name puppeteer-chrome puppeteer-chrome-linux \
   node -e "`cat yourscript.js`"
```

https://github.com/ebidel/try-puppeteer 有一个完整示例，演示如何从运行在 App Engine Flex（Node）上的 web 服务器调用这个 Dockerfile。

#### 在只读容器中运行

Chrome 在启动过程中会写入 profile、配置和缓存文件。在只读容器里，或者只挂载了特定可写位置的容器里，请确保这些路径指向可写目录。否则 Chrome 可能在 Puppeteer 连上之前就失败，一个常见错误是
`chrome_crashpad_handler: --database is required`。

如果你的容器提供了可写的 `/tmp`，可以把 Chrome 的 XDG 配置和缓存位置指到那里：

```Dockerfile
ENV XDG_CONFIG_HOME=/tmp/.chromium
ENV XDG_CACHE_HOME=/tmp/.chromium
```

Puppeteer 还需要一个可写的 user data 目录。默认情况下 Puppeteer 会在操作系统临时目录下创建一个临时 profile，必要时你也可以显式指定位置：

```ts
const browser = await puppeteer.launch({
  userDataDir: '/tmp/.puppeteer-profile',
});
```

或者，把这些目录挂载成可写卷，并确保运行 Chrome 的用户对它们有所有权。

#### 在 Alpine 上运行

注意 Chrome [并不原生支持 Alpine](https://support.google.com/chrome/a/answer/7100626?hl=en#:~:text=Linux)，所以务必确认你在 Alpine 上装了兼容的系统依赖，并在使用前先测试镜像。可参考 [chrome/installer/linux/rpm/dist_package_provides.json](https://source.chromium.org/chromium/chromium/src/+/main:chrome/installer/linux/rpm/dist_package_provides.json) 和 [chrome/installer/linux/debian/dist_package_versions.json](https://source.chromium.org/chromium/chromium/src/+/main:chrome/installer/linux/debian/dist_package_versions.json)，上面列出了受支持发行版所需的系统包。

> **注意**
>
> Alpine 3.20 当前的 Chromium 版本会导致 Puppeteer 超时。降级到 Alpine 3.19 可以解决这个问题。
> 见 [#11640](https://github.com/puppeteer/puppeteer/issues/11640)、[#12637](https://github.com/puppeteer/puppeteer/issues/12637)、[#12189](https://github.com/puppeteer/puppeteer/issues/12189)

你需要先找到 [最新的 Chromium 包](https://pkgs.alpinelinux.org/package/edge/community/x86_64/chromium)，
然后查一下 Puppeteer 的 [支持的浏览器版本](/docs/supported-browsers)，使用与之对应的版本。

**示例：**

Alpine Chromium 版本：`100`

Puppeteer：[Puppeteer v13.5.0](https://github.com/puppeteer/puppeteer/releases/tag/v13.5.0)

Dockerfile：

```Dockerfile
FROM alpine

# 安装 Chromium (100) 包。
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

...

# 告诉 Puppeteer 不要安装 Chrome，我们直接用已安装的那个包。
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Puppeteer v13.5.0 与 Chromium 100 兼容。
RUN yarn add puppeteer@13.5.0

# 添加用户，这样我们就不需要 --no-sandbox。
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# 之后的所有操作都以非特权用户身份运行。
USER pptruser

...
```

### 在 GitlabCI 上运行 Puppeteer

这和上面的一些步骤很像，但需要略微不同的配置才能最终成功。

通常问题长这样：

```bash
Error: Failed to launch chrome! spawn /usr/bin/chromium-browser ENOENT
```

你需要改两个地方：

1. 你的 `gitlab-ci.yml` 配置
2. 启动 puppeteer 时的参数列表

在 `gitlab-ci.yml` 里，我们需要安装一些包，才能在 docker 环境中启动无头 Chrome：

```yml
before_script:
  - apt-get update
  - apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libgconf-2-4
    libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0
    libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1
    libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release
    xdg-utils wget
```

接下来，启动 Puppeteer 时必须使用 `'--no-sandbox'` 模式。
这可以通过把它们作为参数传给 `.launch()` 调用来实现：
`puppeteer.launch({ args: ['--no-sandbox'] });`。

### 在 Google Cloud Run 上运行 Puppeteer

Google Cloud Run 在把 HTTP 响应写回客户端之后，默认会禁用 CPU。也就是说，如果你在响应发出之后才“在后台”跑 puppeteer，它会显得非常慢（启动要花 1-5 分钟）。

所以这个简单的 express 应用会明显变慢：

```js
import express from 'express';

const app = express();

app.post('/test-puppeteer', (req, res) => {
  res.json({
    jobId: 123,
    acknowledged: true,
  });

  puppeteer.launch().then(browser => {
    // 两分钟之后……
  });
});

app.listen(3000);
```

它慢是因为在 GCR 上，puppeteer 是在响应发出之后才启动的，而那时 CPU 已经被禁用。你想要的写法其实是这样：

```js
app.post('/test-puppeteer', (req, res) => {
  puppeteer.launch().then(browser => {
    // 一秒之后……
    res.json({
      jobId: 123,
      acknowledged: true,
    });
  });
});
```

如果你确实想在后台跑这些东西，那就需要“**始终启用 CPU**”（进入 Google Cloud Run Service > Edit & Deploy Revision > CPU allocation and pricing），即使响应已经发出也保持可用。这样问题就解决了。

#### 小贴士

启动 Chrome 时看到奇怪的错误？本地开发时试试用
`docker run --cap-add=SYS_ADMIN` 运行容器。由于 Dockerfile 添加的 `pptr` 用户是非特权用户，它可能不具备所有必需的权限。

如果你发现有一大堆僵尸 Chrome 进程残留，[dumb-init](https://github.com/Yelp/dumb-init) 值得一试。系统对 PID=1 的进程有特殊处理，这使得在某些情况下（例如在 Docker 里）很难正确终止 Chrome。

### 在云端运行 Puppeteer

#### 在 Google App Engine 上运行 Puppeteer

[App Engine 标准环境](https://cloud.google.com/appengine/docs/standard/nodejs/)
的 Node.js 运行时自带运行 Headless Chrome 所需的所有系统包。

要使用 `puppeteer`，请在 `package.json` 里把该模块声明为依赖，然后在应用根目录放一个名为
`.puppeteerrc.js` 的文件来覆盖 puppeteer 缓存目录，内容如下：

```ts
import {join} from 'path';

/**
 * @type {import("puppeteer").Configuration}
 */
export default {
  cacheDirectory: join(import.meta.dirname, 'node_modules', '.puppeteer_cache'),
};
```

> **说明**
>
> Google App Engine 会在多次构建之间缓存你的 `node_modules`。
> 把 Puppeteer 缓存目录指定为 `node_modules` 的子目录，可以缓解 Puppeteer 找不到浏览器可执行文件的问题，
> 这类问题通常是因为 `postinstall` 没有被执行。

#### 在 Google Cloud Functions 上运行 Puppeteer

[Google Cloud Functions](https://cloud.google.com/functions/docs/)
的 Node.js 运行时自带运行 Headless Chrome 所需的所有系统包。

要使用 `puppeteer`，请在 `package.json` 里把该模块声明为依赖，然后在应用根目录放一个名为
`.puppeteerrc.js` 的文件来覆盖 puppeteer 缓存目录，内容如下：

```ts
import {join} from 'path';

/**
 * @type {import("puppeteer").Configuration}
 */
export default {
  cacheDirectory: join(import.meta.dirname, 'node_modules', '.puppeteer_cache'),
};
```

> **说明**
>
> Google Cloud Functions 会在多次构建之间缓存你的 `node_modules`。把 puppeteer 缓存目录指定为 `node_modules`
> 的子目录，可以缓解命中缓存时 puppeteer 安装流程不被执行的问题。

#### Google Cloud Run 上的 Puppeteer

[Google Cloud Run](https://cloud.google.com/run/docs/) 默认的 Node.js 运行时并不自带运行
Headless Chrome 所需的系统包。你需要自己准备
`Dockerfile`，并[补上缺失的依赖](#chrome-在-linux-上无法启动)。

#### 在 Heroku 上运行 Puppeteer

在 Heroku 上运行 Puppeteer 需要一些额外依赖，而 Heroku 为你启动的 Linux 机器上并不包含这些依赖。要在部署时装上这些依赖，请在 Settings > Buildpacks 里为你的应用把 Puppeteer Heroku buildpack 加到 buildpack 列表。

buildpack 的地址是
https://github.com/jontewks/puppeteer-heroku-buildpack

启动 Puppeteer 时请确保使用 `'--no-sandbox'` 模式。这可以通过把它作为参数传给 `.launch()` 调用来实现：
`puppeteer.launch({ args: ['--no-sandbox'] });`。

点击 add buildpack 之后，把那个地址粘贴进输入框，然后点击保存。下次部署时，你的应用就会一并安装 Puppeteer 运行所需的依赖。

如果你需要渲染中文、日文或韩文字符，可能需要使用带额外字体文件的 buildpack，例如
https://github.com/CoffeeAndCode/puppeteer-heroku-buildpack

另外还有 @timleland 写的
[简单指南](https://timleland.com/headless-chrome-on-heroku/)，其中包含一个示例项目：
[https://timleland.com/headless-chrome-on-heroku/](https://timleland.com/headless-chrome-on-heroku/)。

#### 在 AWS Lambda 上运行 Puppeteer

AWS Lambda 的 [限制](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)
把部署包大小限制在 50MB 左右。这让在 Lambda 上运行无头 Chrome（因而也是 Puppeteer）变得棘手。社区整理了一些绕过该问题的资源：

- https://github.com/sparticuz/chromium （一个与供应商和框架都无关的库，支持现代版本的 `chromium`）

#### 在运行 Amazon Linux 的 AWS EC2 实例上运行 Puppeteer

如果你在 CI/CD 流水线中使用运行 amazon-linux 的 EC2 实例，并且想在 amazon-linux 上跑 Puppeteer 测试，请按以下步骤操作。

1. 要安装 Chromium，你得先启用作为
   [EPEL（Extra Packages for Enterprise Linux）](https://repost.aws/knowledge-center/ec2-enable-epel)
   一部分的 `amazon-linux-extras`：

   ```bash
   sudo amazon-linux-extras install epel -y
   ```

1. 接下来安装 Chromium：

   ```bash
   sudo yum install -y chromium
   ```

这样 Puppeteer 就能启动 Chromium 来跑你的测试了。如果你不启用 EPEL，而是继续把 chromium 作为 `npm install` 的一部分来安装，由于缺少 `libatk-1.0.so.0` 以及许多其他包，Puppeteer 无法启动 Chromium。

### 代码转译问题

如果你使用 babel 或 TypeScript 这类 JavaScript 转译器，用 async 函数调用
`evaluate()` 可能不生效。这是因为
`puppeteer` 用 `Function.prototype.toString()` 来序列化函数，而转译器可能会改动产出的代码，使其与 `puppeteer` 不兼容。

解决这个问题的一个办法是告诉转译器不要改动代码，例如配置 TypeScript 使用最新的 ecma 版本（`"target": "es2018"`）。另一个办法是用字符串模板代替函数：

```ts
await page.evaluate(`(async() => {
   console.log('1');
})()`);
```
