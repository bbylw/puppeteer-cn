export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faq: FaqItem[] = [
  {
    id: 'who-maintains',
    question: '谁在维护 Puppeteer？',
    answer:
      '<p>Chrome Browser Automation 团队维护这个库，不过我们也很欢迎你的帮助与专业经验！见<a href="https://pptr.dev/contributing" target="_blank" rel="noreferrer">贡献指南</a>。</p>',
  },
  {
    id: 'cross-browser',
    question: '跨浏览器支持现在是什么状态？',
    answer:
      '<p>从 Puppeteer v23.0.0 起，Puppeteer 同时支持 Chrome 与 Firefox。</p><p>自动化 Chrome 时，Puppeteer 默认使用 Chrome DevTools Protocol（CDP），但也可以用 WebDriver BiDi 来驱动；自动化 Firefox 时默认使用 WebDriver BiDi。API 支持上的细微差异，见 <a href="https://pptr.dev/webdriver-bidi" target="_blank" rel="noreferrer">WebDriver BiDi 指南</a>。</p>',
  },
  {
    id: 'bidi',
    question: 'Puppeteer 支持 WebDriver BiDi 吗？',
    answer:
      '<p>从 Puppeteer v23.0.0 起，Puppeteer 对 WebDriver BiDi 的支持已可用于生产，可驱动 Chrome 与 Firefox。</p>',
  },
  {
    id: 'cdp',
    question: 'Puppeteer 会继续支持 CDP 吗？',
    answer:
      '<p>会。尽管 Puppeteer 已经支持 WebDriver BiDi，我们并不会停止用 CDP 自动化 Chrome。这样既不破坏依赖 CDP 的既有自动化，也能继续支持那些 Chrome 独有、尚未被 WebDriver BiDi 标准化的用例。</p>',
  },
  {
    id: 'goals',
    question: 'Puppeteer 的目标与原则是什么？',
    answer:
      '<p>项目的目标是：</p><ul><li>提供一个参考实现，展示 <a href="https://chromedevtools.github.io/devtools-protocol/" target="_blank" rel="noreferrer">Chrome DevTools</a> 与 <a href="https://w3c.github.io/webdriver-bidi/" target="_blank" rel="noreferrer">WebDriver BiDi</a> 协议的能力。</li><li>推动自动化跨浏览器测试的采用。</li><li>帮助内部试用 DevTools Protocol 与 WebDriver BiDi 的新特性……顺便抓出 bug！</li><li>更深入地了解自动化浏览器测试的痛点，并帮助填补这些空白。</li></ul><p>我们借鉴 <a href="https://www.chromium.org/developers/core-principles" target="_blank" rel="noreferrer">Chromium 的原则</a>来做产品决策：</p><ul><li><strong>速度</strong>：相比手动操作的页面，Puppeteer 的性能开销几乎为零。</li><li><strong>安全</strong>：Puppeteer 在浏览器进程之外运行，因此自动化潜在恶意的页面也是安全的。</li><li><strong>稳定</strong>：Puppeteer 不应时好时坏，也不应泄漏内存。</li><li><strong>简单</strong>：Puppeteer 提供易于使用、理解和调试的高级 API。</li></ul>',
  },
  {
    id: 'selenium',
    question: 'Puppeteer 能替代 Selenium 吗？',
    answer:
      '<p>Puppeteer 是一个基于 Node.js 的参考实现，演示如何用 CDP 与 WebDriver BiDi 自动化浏览器——而 Selenium 项目也在为同一套 Web 标准做贡献。</p><p>Selenium 项目在多个方面超出了 Puppeteer 的范围：它为 JavaScript 之外的语言提供绑定，还提供像 Selenium Grid 这样大规模编排自动化的工具。这两者都超出了 Puppeteer 的职责范围。</p><p>有一些社区项目在核心之外为 Puppeteer 增加能力，让测试等事情更方便，例如 <a href="https://github.com/smooth-code/jest-puppeteer" target="_blank" rel="noreferrer">jest-puppeteer</a> 或 <a href="https://pptr.dev/integrations/ng-schematics" target="_blank" rel="noreferrer">Puppeteer 的 Angular 集成</a>。</p>',
  },
  {
    id: 'version-mismatch',
    question: '为什么 Puppeteer v.XXX 不能和某个版本的 Chrome 或 Firefox 一起工作？',
    answer:
      '<p>每个 Puppeteer 版本都与特定的浏览器版本紧密绑定，以确保与底层协议实现（Chrome DevTools Protocol 与 WebDriver BiDi）兼容。这样做是为了防止 <a href="https://pptr.dev/supported-browsers#chrome" target="_blank" rel="noreferrer">Chrome</a> 或 <a href="https://pptr.dev/supported-browsers#firefox" target="_blank" rel="noreferrer">Firefox</a> 的变更意外破坏 Puppeteer。</p>',
  },
  {
    id: 'browser-version',
    question: 'Puppeteer 使用哪个 Chrome 和 Firefox 版本？',
    answer:
      '<p>查看 <a href="https://github.com/puppeteer/puppeteer/blob/main/packages/puppeteer-core/src/revisions.ts" target="_blank" rel="noreferrer">revisions.ts</a> 中的 <code>chrome</code> 与 <code>firefox</code> 条目。</p>',
  },
  {
    id: 'navigation',
    question: '什么才算一次“导航”（Navigation）？',
    answer:
      '<p>从 Puppeteer 的角度看，<strong>任何改变页面 URL 的事情都是“导航”</strong>。除了浏览器访问网络、从 Web 服务器获取新文档的常规导航之外，这还包括<a href="https://www.w3.org/TR/html5/single-page.html#scroll-to-fragid" target="_blank" rel="noreferrer">锚点导航</a>与 <a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API" target="_blank" rel="noreferrer">History API</a> 的使用。</p><p>按这个定义，<strong>Puppeteer 可以无缝地处理单页应用。</strong></p>',
  },
  {
    id: 'trusted',
    question: '“可信”与“不可信”输入事件有什么区别？',
    answer:
      '<p>在浏览器中，输入事件可以分为两大类：可信（trusted）与不可信（untrusted）。</p><ul><li><strong>可信事件</strong>：用户与页面交互产生的事件，例如使用鼠标或键盘。</li><li><strong>不可信事件</strong>：由 Web API 生成的事件，例如 <code>document.createEvent</code> 或 <code>element.click()</code>。</li></ul><p>网站可以区分这两类事件：使用 <a href="https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted" target="_blank" rel="noreferrer"><code>Event.isTrusted</code></a> 事件标志；或者嗅探伴随事件——例如每个可信的 <code>click</code> 事件之前都会有 <code>mousedown</code> 与 <code>mouseup</code>。</p><p>对自动化而言，生成可信事件很重要。<strong>Puppeteer 生成的所有输入事件都是可信的，并会触发正确的伴随事件。</strong>如果出于某种原因需要不可信事件，总可以进入页面上下文，用 <code>page.evaluate</code> 生成一个假事件：</p><pre class="faq-code"><code>await page.evaluate(() =&gt; {\n  document.querySelector(\'button[type=submit]\').click();\n});</code></pre>',
  },
  {
    id: 'media',
    question: 'Puppeteer 支持媒体与音频播放吗？',
    answer:
      '<p>Puppeteer 默认使用 <a href="https://developer.chrome.com/blog/chrome-for-testing/" target="_blank" rel="noreferrer">Chrome for Testing</a> 二进制，从 <a href="https://chromiumdash.appspot.com/commit/12d607016c31ea13579e897740c765be189ed6eb" target="_blank" rel="noreferrer">M120</a> 起它们自带专有编解码器支持。</p>',
  },
  {
    id: 'help',
    question: '我在测试环境里安装或运行 Puppeteer 遇到问题，该去哪里找帮助？',
    answer:
      '<p>我们有一份针对各种操作系统的<a href="https://pptr.dev/troubleshooting" target="_blank" rel="noreferrer">故障排查指南</a>，列出了所需的依赖。</p>',
  },
  {
    id: 'more',
    question: '我还有更多问题，去哪里提问？',
    answer:
      '<p>获取帮助的方式有很多：</p><ul><li>问题咨询：<a href="https://stackoverflow.com/questions/tagged/puppeteer" target="_blank" rel="noreferrer">Stack Overflow</a></li><li>bug 报告：<a href="https://github.com/puppeteer/puppeteer/issues" target="_blank" rel="noreferrer">GitHub Issues</a></li></ul><p>发问之前，请先在这些渠道里搜索一遍。</p>',
  },
];
