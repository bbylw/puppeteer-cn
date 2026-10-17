---
title: 系统要求
description: Node 版本、TypeScript 版本，以及 Chrome for Testing 与 Firefox 在各平台上运行所需的系统依赖。
order: 4
source: https://pptr.dev/guides/system-requirements
summary:
  - Node 22.12+ 与 TypeScript 5.0.1+
  - Chrome 与 Firefox 在两个大平台族上的架构支持
---

## Node 与 TypeScript

- Node 22.12+。Puppeteer 跟随 Node 最新的 [maintenance LTS](https://github.com/nodejs/Release#release-schedule) 版本。
- TypeScript 5.0.1+（如果使用 TypeScript）。
  - 如果你要对 `node_modules` 做[类型检查](https://www.typescriptlang.org/tsconfig/#skipLibCheck)，target 需要设为 ES2022 或更高。

## Chrome

Chrome for Testing 浏览器的系统要求：

- [Windows](https://support.google.com/chrome/a/answer/7100626?hl=en#:~:text=the%20specified%20criteria.-,Windows,-To%20use%20Chrome)：x64 架构。
- [macOS](https://support.google.com/chrome/a/answer/7100626?hl=en#:~:text=Not%20yet%20scheduled-,Mac,-To%20use%20Chrome)：x64 与 arm64 架构。
- [Debian/Ubuntu Linux](https://support.google.com/chrome/a/answer/7100626?hl=en#:~:text=10.15%20or%20later-,Linux,-To%20use%20Chrome)：x64 与 arm64 架构。
  - 所需的系统包见 [dist_package_versions.json](https://source.chromium.org/chromium/chromium/src/+/main:chrome/installer/linux/debian/dist_package_versions.json)。
- [openSUSE/Fedora Linux](https://support.google.com/chrome/a/answer/7100626?hl=en#:~:text=10.15%20or%20later-,Linux,-To%20use%20Chrome)：x64 与 arm64 架构。
  - 所需的系统包见 [dist_package_provides.json](https://source.chromium.org/chromium/chromium/src/+/main:chrome/installer/linux/rpm/dist_package_provides.json)。
- 在 Windows 上需要 `tar.exe` 或 PowerShell、在 macOS/Linux 上需要 `unzip` 来解包 Chrome for Testing 二进制，除非安装了可选的 [`yauzl`](https://www.npmjs.com/package/yauzl) 依赖。

## Firefox

Firefox 浏览器的系统要求：

- 见 [https://www.mozilla.org/en-US/firefox/system-requirements/](https://www.mozilla.org/en-US/firefox/system-requirements/)。
- 在 Linux 上解包 Firefox 版本需要 `xz` 或 `bzip2` 工具。
