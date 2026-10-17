import { useState } from 'react';

type Line = {
  code: string;
  note: string;
  api: string;
};

const LINES: Line[] = [
  {
    code: "import puppeteer from 'puppeteer';",
    note: '导入库。如果你自己管理浏览器，这一行换成 puppeteer-core。',
    api: 'puppeteer',
  },
  {
    code: 'const browser = await puppeteer.launch();',
    note: '启动一个 Chrome 实例，返回 browser。默认无头，没有窗口。',
    api: 'PuppeteerNode.launch',
  },
  {
    code: 'const page = await browser.newPage();',
    note: '新建一个标签页。之后所有读写都发生在这个 page 上。',
    api: 'Browser.newPage',
  },
  {
    code: "await page.goto('https://developer.chrome.com/');",
    note: '导航到目标地址，等页面加载完成再返回。',
    api: 'Page.goto',
  },
  {
    code: 'await page.setViewport({ width: 1080, height: 1024 });',
    note: '把视口定成这个尺寸。截图、媒体查询、布局都按它重算。',
    api: 'Page.setViewport',
  },
  {
    code: "await page.keyboard.press('/');",
    note: '发送一次真实按键。这个站用它打开搜索框。',
    api: 'Keyboard.press',
  },
  {
    code: "await page.locator('::-p-aria(Search)').fill('automate beyond recorder');",
    note: '按无障碍名称定位搜索框，再写入文字。比 CSS 选择器更抗改版。',
    api: 'Locator.fill',
  },
  {
    code: "await page.locator('.devsite-result-item-link').click();",
    note: '点击第一个结果。点击会等待元素可交互，不会点空。',
    api: 'Locator.click',
  },
  {
    code: "const h = await page.locator('::-p-text(Customize and automate)').waitHandle();",
    note: '用页面上唯一的文字片段定位元素，拿到一个 JSHandle。',
    api: 'Locator.waitHandle',
  },
  {
    code: 'console.log(await h?.evaluate(el => el.textContent));',
    note: '在页面上下文里执行函数，把标题文本读回 Node.js。',
    api: 'JSHandle.evaluate',
  },
  {
    code: 'await browser.close();',
    note: '关掉浏览器，进程随之退出。忘了这一行，CI 会一直挂着。',
    api: 'Browser.close',
  },
];

const KEYWORDS = new Set(['const', 'await', 'new', 'let', 'import', 'from']);

function highlight(code: string) {
  const parts = code.split(
    /('(?:[^']*)'|`[^`]*`|\/\/[^\n]*|\b\d+\b|\b(?:const|await|new|let|import|from)\b)/g
  );
  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith("'") || part.startsWith('`')) {
      return (
        <span key={index} className="tk tk-str">
          {part}
        </span>
      );
    }
    if (part.startsWith('//')) {
      return (
        <span key={index} className="tk tk-com">
          {part}
        </span>
      );
    }
    if (KEYWORDS.has(part)) {
      return (
        <span key={index} className="tk tk-kw">
          {part}
        </span>
      );
    }
    if (/^\d+$/.test(part)) {
      return (
        <span key={index} className="tk tk-num">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function CodeWalkthrough() {
  const [active, setActive] = useState(4);
  const current = LINES[active] ?? LINES[0]!;

  return (
    <div className="grid items-start gap-x-10 gap-y-9 md:grid-cols-12">
      <div className="min-w-0 md:col-span-7">
        <h2 className="mb-6 max-w-[22ch] text-[26px] font-medium leading-[1.12] tracking-[-0.025em]">
          它到底做了什么
        </h2>

        <div className="walk-code">
          {LINES.map((line, index) => (
            <button
              key={index}
              type="button"
              className="walk-line"
              data-active={index === active}
              onClick={() => setActive(index)}
              aria-pressed={index === active}
              aria-label={`第 ${index + 1} 行：${line.code}`}
            >
              <code>{highlight(line.code)}</code>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-4 md:col-start-9">
        <p className="walk-label">选中这一行</p>
        <p className="mt-3 text-[21px] leading-[1.45] tracking-[-0.01em]">
          {current.note}
        </p>
        <p className="mt-3 font-display text-[13px] text-muted">{current.api}</p>

        <p className="walk-label mt-9">它打印出什么</p>
        <pre className="walk-out mt-3">
          <code>
            <span className="text-[#7fe0b0]">$ node search.mjs</span>
            {'\n'}
            The title of this blog post is &quot;Customize and automate&quot;.
          </code>
        </pre>
      </div>
    </div>
  );
}
