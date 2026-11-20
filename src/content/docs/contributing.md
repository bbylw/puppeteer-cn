---
title: 贡献指南
description: 如何向 Puppeteer 提交贡献：CLA、本地构建与测试、代码风格与项目结构，以及维护者的 Chrome 版本滚动、npm 发布与 Bug 分诊流程。
order: 26
category: community
source: https://pptr.dev/contributing
summary:
  - 只需签一次的贡献者许可协议（CLA）
  - clone、装依赖、构建、跑测试四步上手
  - 构建、测试、代码风格与文档约定，以及维护者的版本滚动、发布与分诊流程
---

首先，感谢你对 Puppeteer 感兴趣！我们非常乐意接受你的补丁和贡献。

### 贡献者许可协议

对本项目的贡献必须附带一份 Contributor License Agreement（贡献者许可协议，简称 CLA）。你（或你的雇主）保留你所贡献内容的版权，这份协议只是授权我们把你的贡献作为项目的一部分来使用和再分发。前往 [https://cla.developers.google.com/](https://cla.developers.google.com/) 可以查看你已存档的协议，或者签署一份新的。

通常你只需要提交一次 CLA，所以如果你之前已经提交过（哪怕是给别的项目），大概率不用再提交一次。

### 上手准备

1. 克隆本仓库

   ```bash
   git clone https://github.com/puppeteer/puppeteer
   cd puppeteer
   ```

   或者

   [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=90796663&machine=standardLinux32gb&devcontainer_path=.devcontainer%2Fdevcontainer.json)

2. 安装依赖

   ```bash
   npm install
   # 或者默认顺带下载 Firefox
   PUPPETEER_BROWSER=firefox npm install
   ```

3. 构建所有 package

   ```bash
   npm run build
   ```

4. 运行所有测试

   ```bash
   npm test
   ```

### 构建单个 package

要构建单个 package，可以运行：

```bash
npm run build --workspace <package> # 例如 puppeteer
```

它会自动把所有被依赖的 package 一起构建好，所以只指定一个 package 就够了。之所以能做到这点，靠的是
[wireit](https://github.com/google/wireit)，它的行为和
[GNU Make](https://www.gnu.org/software/make/) 很像。

#### 监听模式

要让某个 package 持续构建，可以运行：

```bash
npm run build --watch --workspace <package> # 例如 puppeteer
```

注意只能指定一个要监听的 package，否则不会得到预期的效果。如上所说，因为有
[wireit](https://github.com/google/wireit)，一旦发生变更，所有依赖都会被构建或重新构建（如果需要）。

### 清理过期产物

有些生成的产物（比如 `packages/puppeteer-core/src/types.ts`）可能会过期失效，因为这些产物依赖构建系统无法表达清楚的复杂条件（例如某些文件的命名）。要清理这类产物，可以运行：

```bash
npm run clean
# 或者指定 package
npm run clean --workspace <package>
```

### 更全面的测试

除了 `npm test`，还有一些通常会在 CI 里检查的 [`npm` scripts](https://docs.npmjs.com/cli/using-npm/scripts)：

- `test-install` - 测试 `puppeteer` 和 `puppeteer-core` 能否正常安装并且可用。
- `test-types` - 用 [`tsd`](https://github.com/SamVerschueren/tsd) 测试 `puppeteer` 的 TypeScript 类型。
- `test:chrome:**` - 在 Chrome 上测试 `puppeteer`。
- `test:firefox:**` - 在 Firefox 上测试 `puppeteer`。
- `unit` - 运行单元测试。

默认的 `npm test` 会运行 `test:{chrome,firefox}:headless`，一般来说这就够了。

Puppeteer 用的是一个基于 Mocha 定制的测试运行器，它会查阅
[TestExpectations.json](https://github.com/puppeteer/puppeteer/blob/main/test/TestExpectations.json)
来判断某个测试结果是符合预期还是失败。关于这个测试运行器的更多信息见
[`tools/mocha-runner`](https://github.com/puppeteer/puppeteer/tree/main/tools/mocha-runner)。

#### 单元测试

只测试代码本身（不启动浏览器）的测试放在它们所测试的类旁边，使用 Node 测试运行器运行（需要 Node 22+）：

```bash
npm run unit
```

### 代码评审

所有提交都需要评审，项目成员提交的也不例外。我们用 GitHub pull request 来做这件事。关于如何使用 pull request 的更多信息，请查阅
[GitHub Help](https://help.github.com/articles/about-pull-requests/)。

### 代码风格

我们的编码风格完全由
[`eslint.config`](https://github.com/puppeteer/puppeteer/blob/main/eslint.config.mjs)
（[ESLint](https://eslint.org/)）和
[`prettier.config.js`](https://github.com/puppeteer/puppeteer/blob/main/prettier.config.js)
（[Prettier](https://prettier.io)）定义。

PR 里的代码会自动检查，你也可以手动检查自己的代码：

```bash
npm run lint
```

如果报出一些错误，可以尝试用下面的命令修复：

```bash
npm run format
```

### 项目结构

下面是 Puppeteer 中各个主要目录的说明：

- `packages` 包含所有公开的源代码。
- `test` 包含所有测试代码。
- `test-d` 用 [`tsd`](https://github.com/SamVerschueren/tsd) 做类型测试。
- `tools` 包含构建等流程里用到的各种零散脚本。
- `tools/mocha-runner` - 包含我们测试运行器的源代码。

### API 准则

在编写新的 API 方法时，请考虑以下几点：

- 尽量只暴露必要的信息。拿不准的时候，就不要新增暴露。
- 优先使用方法，而不是 getter/setter。
  - 唯一的例外是命名空间，例如 `page.keyboard` 和 `page.coverage`
- 所有字符串字面量必须是小写，事件名和选项值也一样。
- 不要添加“糖衣” API（在用户侧随手就能实现的 API），除非这类需求**极其**强烈。

### 提交信息

提交信息应遵循
[Conventional Commits 格式](https://www.conventionalcommits.org/en/v1.0.0/#summary)。

特别是破坏性变更，必须在提交信息末尾的 footer 里清楚标注为 “BREAKING CHANGE:”。示例：

```
fix(page): fix page.pizza method

This patch fixes page.pizza so that it works with iframes.

Issues: #123, #234

BREAKING CHANGE: page.pizza now delivers pizza at home by default.
To deliver to a different location, use the "deliver" option:
  `page.pizza({deliver: 'work'})`.
```

### 编写文档

文档由 TSDoc 注释通过 `npm run docs` 生成。合并后它会自动发布到我们的文档站，并在每次发布时生成对应版本。

也就是说，`docs/api` 下那些 markdown 文件，你不要手动去改。

### 编写 TSDoc 注释

对 Puppeteer 的每一处改动都应当用 TSDoc 注释写清楚文档。具体语法请参考
[API Extractor 文档](https://api-extractor.com/pages/tsdoc/doc_comment_syntax/)。

- 每个新方法都要按它是否属于公开 API，加上 `@public` 或 `@internal` 标签。
- 注释里每行不要超过 90 个字符（超了 ESLint 会警告你）。如果你用 VSCode，强烈推荐
  [Rewrap 插件](https://marketplace.visualstudio.com/items?itemName=stkb.rewrap)！

### 本地运行文档站

1. 在仓库根目录用 `npm i --ignore-scripts` 安装所有依赖。
2. 运行 `npm run docs`，它会在 `puppeteer/docs/api` 下生成所有 `.md` 文件。
3. 在 `puppeteer/website` 目录下运行 `npm i`。
4. 在 `puppeteer/website` 目录下运行 `npm start`。

### 添加新依赖

对所有依赖（安装依赖和开发依赖）：

- 如果想要的功能很容易自己实现，**不要**新增依赖。
- 如果要加依赖，它必须是维护良好、值得信任的。

引入新的安装依赖，门槛尤其高：

- 除非对项目成败至关重要，**不要**添加安装依赖。

与环境无关的依赖还有额外的注意事项，详见
[`third_party/README.md`](https://github.com/puppeteer/puppeteer/blob/main/packages/puppeteer-core/third_party/README.md)。

### 测试要点

- 每个功能都应配有测试。
- 每个公开的 API 事件/方法都应配有测试。
- 测试不应依赖外部服务。
- 测试要在 Mac、Linux 和 Windows 三个平台上都能跑通，这一点对截图测试尤其重要。

如果某个测试在某些配置下预期会失败，或者变得不稳定（flaky），请更新
[TestExpectations.json](https://github.com/puppeteer/puppeteer/blob/main/test/TestExpectations.json)
来反映这一点。关于 TestExpectations.json 的更多信息见
[`tools/mocha-runner`](https://github.com/puppeteer/puppeteer/tree/main/tools/mocha-runner)。

### API 覆盖率

每个公开的 API 方法或事件都应当在测试里至少被调用一次。为了保证这一点，主 `test` 命令会在测试过程中运行覆盖率统计。

### 调试 Puppeteer

参见[调试技巧](/docs/debugging)。

#### 在 VSCode 中调试 Puppeteer 测试

把仓库提供的默认 `.vscode/launch.template.json` 复制成 `.vscode/launch.json`，然后使用 VSCode 内置的调试器来调试测试。

记得在启动调试之前先构建测试：

```bash
npm run build --workspace @puppeteer-test/test
```

## 项目维护者须知

### 滚动到新的 Chrome 版本

有一个 [GitHub action](https://github.com/puppeteer/puppeteer/blob/main/.github/workflows/update-browser-pins.yml) 每天运行一次。
这个 action 提供了手动触发入口，见 [Actions Tab](https://github.com/puppeteer/puppeteer/actions/workflows/update-browser-pins.yml)。

#### 手动操作说明

你可以在本地运行 [`tools/update_browser_revision.mjs`](https://github.com/puppeteer/puppeteer/blob/main/tools/update_browser_revision.mjs)，
看看是否有需要提交的改动。

> 注意：你可能需要运行 `node --experimental-fetch tools/update_browser_revision.mjs`，因为这个脚本依赖 `fetch`

下面这些步骤是上面那个脚本的手动版本。

1. 通过 https://googlechromelabs.github.io/chrome-for-testing/ 或 https://chromiumdash.appspot.com/ 找到合适的 Chrome `revision` 和 `version`。
2. 用找到的 `version` 更新 `packages/puppeteer-core/src/revisions.ts`。
3. 在 `versions.json` 里更新新的 Chrome 到 Puppeteer 的 `version` 映射，并把 `lastMaintainedChromeVersion` 改成列表中紧随其后的那个版本。
4. 运行 `npm run check`。如果失败，把 `packages/puppeteer-core/package.json` 更新为期望的 `devtools-protocol` 版本，然后运行 `npm install` 生成更新后的 `package-lock.json`。
5. 依次运行 `npm run clean`、`npm install` 和 `npm run build`。
6. 运行 `npm test` 并确保所有测试都通过。如果有测试失败，[bisect（二分定位）](#二分定位上游变更)出导致失败的上游原因，然后要么相应更新测试预期（如果这本来就是预期变更），要么在 Puppeteer 里绕开这些变更（如果改变 Puppeteer 的可观测行为并不是我们想要的）。
7. 提交并推送你的改动，然后开一个 pull request。提交信息里必须包含以 `Chrome <version>` 格式书写的版本号，以保证 [pptr.dev](https://pptr.dev/) 能正确解析，例如 `feat(chrome): roll to Chrome 90.0.4427.0`。

#### 二分定位上游变更

要二分 Chrome/Chromium 的变更，使用 https://www.chromium.org/developers/bisect-builds-py/ 。

```bash
python3 <path-to-chromium-checkout>/tools/bisect-builds.py -g <known-good> -b <known-bad> -cft -v --verify-range --not-interactive -c "BINARY=%p npm run test:chrome:<test-type>"
```

或者运行 `npx puppeteer browsers bisect`，它把上面的功能包装成了可直接用于 Puppeteer 测试的形式。

```bash
# 在 Puppeteer 仓库根目录执行
npx puppeteer browsers bisect -g <known-good> -b <known-bad>
```

### 发布到 npm

我们用 [release-please](https://github.com/googleapis/release-please) 来自动化发布。需要发版时，在
我们的 [pull requests](https://github.com/puppeteer/puppeteer/pulls) 里找到那个发布 PR 并合并即可。

#### 如果 Release Please 失败了

在 release-please 失败的情况下，需要做以下处理：

1. 把本该发布的每个 package 的 CHANGELOG 中缺失的内容补上。例如缺少了标题行，你可能需要补上：

   - puppeteer 的标题行：

     ```md
     ## [{NEW_VERSION}](https://github.com/puppeteer/puppeteer/compare/v{PREVIOUS_VERSION}...v{NEW_VERSION}) ({CURRENT_DATE})`
     ```

   - 其他 package 的标题行：

     ```md
     ## [{NEW_VERSION}](https://github.com/puppeteer/puppeteer/compare/{PACKAGE_FOLDER_NAME}-v{PREVIOUS_VERSION}...{PACKAGE_FOLDER_NAME}-v{NEW_VERSION}) ({CURRENT_DATE})
     ```

2. 为每个 package 创建 GitHub release，做法参照以往的 release。

### Bug 分诊指南

[查看新收到的 bug 报告](https://github.com/puppeteer/puppeteer/issues) 中那些还没有 `confirmed` 或 `needs-feedback` 标签的：

1. 确认 issue 打了 `bug` 或 `feature` 标签之一。
2. 如果 issue 没有明确的复现方式，或者你复现不出来，就向用户索要复现方式，并打上 `needs-feedback` 标签。
3. 跟进你之前索要过反馈的 issue（用户回复时 GitHub 会给你发通知）。
4. 如果用户一直没有提供反馈，issue 最终会被 stale bot 关闭。
5. 如果你能复现这个问题，加上 `confirmed` 标签。
6. 如果问题出在 Chromium 那边，创建对应的 crbug.com issue，给 GitHub issue 打上 `upstream` 标签，并在评论里贴上 crbug.com 的链接。
7. 如果 issue 与 Puppeteer 和 Chromium 都无关，关闭它。
8. 如果 issue 是关于文档缺失或文档有误，打上 `documentation` 标签。

PDF 相关的 issue：

1. 如果在普通打印对话框里、和/或有头（headful）模式下也能复现，[在 `Blink>Layout` 组件下提交一个 crbug.com issue](https://bugs.chromium.org/p/chromium/issues/entry?components=Blink%3ELayout)。
2. 如果问题是 Headless 模式特有的，[在 `Internals>Headless` 组件下提一个 crbug.com issue](https://bugs.chromium.org/p/chromium/issues/entry?components=Internals%3EHeadless)。
