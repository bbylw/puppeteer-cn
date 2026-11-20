---
title: 示例与用例
description: 官方仓库里的示例、独立的示例合集，以及渲染、抓取、测试等方向上由社区维护的项目、文章与演示清单。
order: 23
category: examples
source: https://pptr.dev/examples
summary:
  - 主仓库 examples 目录下的官方示例
  - 按用例组织的独立示例合集
  - 渲染、抓取与测试方向的社区项目清单
---

### 官方示例

[Puppeteer 仓库](https://github.com/puppeteer/puppeteer/tree/main/examples) 里带了一小批由 Puppeteer 团队维护的示例。

按照 README 中的说明就能把这些示例跑起来。它们覆盖的用例包括从网页生成 PDF、截图，以及拦截请求。

### 示例合集

Puppeteer 有一个专门的[示例仓库](https://github.com/puppeteer/examples)，里面是一批按用例组织起来的示例。

这个合集还在不断扩充，已经覆盖了多种用例，例如把 Puppeteer 进程里的事件转发到浏览器、与页面元素交互、执行 CDP 命令。

### 其他项目、文章与演示

下面这份清单列出了渲染、网页抓取、测试等方向上的用例和示例。

#### 渲染与网页抓取

- **[Puppetron](https://github.com/cheeaun/puppetron)**：一个演示站点，展示怎么用 Puppeteer 和 Headless Chrome 渲染页面。它的灵感来自 [GoogleChrome/rendertron](https://github.com/GoogleChrome/rendertron)，后者目前已被归档。
- **[Thal](https://medium.com/@e_mad_ehsan/getting-started-with-puppeteer-and-chrome-headless-for-web-scrapping-6bf5979dee3e)**：一份入门指南，讲如何用 Puppeteer 和 Chrome Headless 做网页抓取。
- **[pupperender](https://github.com/LasaleFamine/pupperender)**：一个 Express 中间件，会检查进入请求的 User-Agent 头，如果命中一组可配置的 bot，就用 Puppeteer 把页面渲染出来。适合用于 PWA（渐进式 Web 应用）渲染。
- **[headless-chrome-crawler](https://github.com/yujiosaka/headless-chrome-crawler)**：一个爬虫，提供了控制 Headless Chrome、抓取动态网站的 API。
- **[Checkly 的 Puppeteer 示例](https://web.archive.org/web/20240811200732/https://www.checklyhq.com/learn/headless/basics-puppeteer-intro/)**：面向真实场景的端到端 Puppeteer 示例，比如从网页里提取有用的信息、处理常见的登录流程。
- **[browserless](https://github.com/browserless/browserless)**：一个 headless Chrome 服务，可以远程执行 Puppeteer 脚本。
- **[AWS Lambda 上的 Puppeteer](https://github.com/jay-deshmukh/headless-chrome-with-puppeteer-on-AWS-lambda-with-serverless-framework)**：一份指南，讲怎么用 Serverless Framework 在 AWS Lambda 上运行 Puppeteer。
- **[Crawlee](https://github.com/apify/crawlee)**：一个面向 Node.js 和 TypeScript 的网页抓取与浏览器自动化库。它支持 Puppeteer、Playwright、Cheerio、JSDOM 以及裸 HTTP，还能做代理轮换。

#### 测试

- **[angular-puppeteer-demo](https://github.com/Quramy/angular-puppeteer-demo)**：一个演示仓库，展示怎么把 Puppeteer 和 Karma 一起用。
- **[mocha-headless-chrome](https://github.com/direct-adv-interfaces/mocha-headless-chrome)**：一个工具，用 Headless Chrome 在命令行里运行客户端的 Mocha 测试。
- **[puppeteer-to-istanbul-example](https://github.com/bcoe/puppeteer-to-istanbul-example)**：一个演示仓库，展示怎么把 Puppeteer 的覆盖率数据导出成 Istanbul 格式。
- **[jest-puppeteer](https://github.com/argos-ci/jest-puppeteer)**：一个几乎零配置的工具，用来配合 Puppeteer 跑 Jest 测试，还自带一套针对 Puppeteer 的断言库。
- **[puppeteer-har](https://github.com/Everettss/puppeteer-har)**：一个用 Puppeteer 生成 HAR 文件的工具。
- **[puppetry](https://puppetry.app/)**：一个桌面应用，不用写代码就能搭建基于 Puppeteer 和 Jest 的测试。
- **[puppeteer-loadtest](https://github.com/svenkatreddy/puppeteer-loadtest)**：一个命令行工具，用来给 Puppeteer 脚本做压力测试。
- **[cucumber-puppeteer-example](https://github.com/mlampedx/cucumber-puppeteer-example)**：一个示例仓库，演示怎么用 Puppeteer 配合 Cucumber 做集成测试。
