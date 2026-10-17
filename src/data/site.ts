export const site = {
  name: 'Puppeteer',
  nameZh: 'Puppeteer 中文文档',
  version: '25.14.0',
  tagline: '用代码操纵浏览器',
  description:
    'Puppeteer 中文文档：一个 JavaScript 库，提供高级 API，通过 DevTools Protocol 或 WebDriver BiDi 控制 Chrome 与 Firefox，默认无头运行。',
  links: {
    github: 'https://github.com/puppeteer/puppeteer',
    npm: 'https://www.npmjs.com/package/puppeteer',
    api: 'https://pptr.dev/api',
    source: 'https://pptr.dev',
    contributing: 'https://pptr.dev/contributing',
    troubleshooting: 'https://pptr.dev/troubleshooting',
    examples: 'https://github.com/puppeteer/puppeteer/tree/main/examples',
    devtools: 'https://chromedevtools.github.io/devtools-protocol/',
    bidi: 'https://pptr.dev/webdriver-bidi',
  },
} as const;

export const nav = [
  { label: '简介', href: '/docs/what-is-puppeteer' },
  { label: '文档', href: '/docs' },
  { label: '常见问题', href: '/faq' },
] as const;
