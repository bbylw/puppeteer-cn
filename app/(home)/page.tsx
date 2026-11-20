import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import CodeWalkthrough from '@/components/home/CodeWalkthrough';
import HeroStage from '@/components/home/HeroStage';
import PixelLab from '@/components/home/PixelLab';
import { faq } from '@/lib/faq';
import { site } from '@/lib/site';

// reveal 动画的延迟写成 CSS 自定义属性，等价于原 Astro 的 style="--reveal-delay:…"
type StyleVars = CSSProperties & Record<`--${string}`, string>;
const delay = (ms: number): StyleVars => ({ '--reveal-delay': `${ms}ms` });

const steps = [
  { tone: 'light', clause: '先启动一个浏览器。', note: 'puppeteer.launch()' },
  { tone: 'mid', clause: '再开一个空白页。', note: 'browser.newPage()' },
  { tone: 'deep', clause: '像用户一样操作它。', note: 'page.goto() · locator()' },
  { tone: 'dark', clause: '最后关掉它。', note: 'browser.close()' },
] as const;

const features = [
  {
    title: '页面是什么样，截出来就是什么样',
    body: 'page.screenshot() 交回一个 Buffer，page.pdf() 直接给你一份可打印的文档。整页、可视区、单个元素，位置和尺寸都由你指定。',
    src: '/shots/chrome-hero.png',
    width: 2160,
    height: 1200,
    alt: '用 Puppeteer 截取的 developer.chrome.com 首屏局部，大标题为 “A Powerful Web. Made Easier.”',
  },
  {
    title: '单页应用，一次也不落空',
    body: 'Puppeteer 把“任何改变 URL 的行为”都算作导航，包括锚点跳转与 History API。等页面稳定再返回，是默认行为。',
    src: '/shots/pptr-docs.png',
    width: 1800,
    height: 1000,
    alt: '用 Puppeteer 截取的 pptr.dev 文档页局部，标题为 “What is Puppeteer?”。',
  },
  {
    title: '换一个尺寸，就是另一台设备',
    body: '一次 setViewport 调用，页面立刻按 390 × 844 重排。移动端布局的回归测试不必依赖真机，也不必手动拖窗口。',
    src: '/shots/pptr-mobile-top.png',
    width: 780,
    height: 438,
    alt: '用 Puppeteer 以 390 像素宽视口截取的 pptr.dev 页面顶部，导航与标题按移动端布局重排。',
  },
  {
    title: '装完之后，浏览器自己会下来',
    body: '安装时自动下载 Chrome for Testing 与 chrome-headless-shell，版本与库锁定。如果包管理器拦了安装脚本，跑一次 npx puppeteer browsers install。',
    src: '/shots/pptr-code.png',
    width: 1616,
    height: 898,
    alt: '用 Puppeteer 截取的 pptr.dev 安装页局部，含安装命令与“自动下载可能被阻止”的警告。',
  },
];

const facts = [
  { term: '当前版本', detail: `v${site.version}` },
  { term: '底层协议', detail: 'DevTools Protocol / WebDriver BiDi' },
  { term: '可驱动', detail: 'Chrome · Firefox' },
  { term: '两个包', detail: 'puppeteer · puppeteer-core' },
  { term: '默认模式', detail: '无头，可切换有头' },
];

export const metadata: Metadata = {
  // 原 Base.astro：标题就是「Puppeteer 中文文档」，不加后缀模板
  title: { absolute: 'Puppeteer 中文文档' },
  description: site.description,
};

// 原 Base.astro 的 tone="dark" 对应的 theme-color
export const viewport = { themeColor: '#05070a' };

export default function HomePage() {
  return (
    <>
      {/* 1. hero */}
      <section className="hero">
        <div className="shell">
          <HeroStage />

          <div className="mt-[clamp(24px,3.4vh,38px)] flex flex-col items-center gap-6 text-center">
            <p className="max-w-[48ch] text-[16px] leading-relaxed text-white/70 md:text-[18px]">
              Puppeteer 是一个 JavaScript 库，用一套高级 API 通过 DevTools Protocol 或 WebDriver
              BiDi 控制 Chrome 与 Firefox。默认无头运行，也可以带着窗口出现。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Link className="btn" href="/docs/installation">
                开始安装
              </Link>
              <Link
                className="link-underline text-[16px] text-white/80"
                href="/docs/what-is-puppeteer"
              >
                先看它是什么
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. intro：左文右表，铺满一行 */}
      <section className="sec">
        <div className="shell grid gap-x-10 gap-y-12 md:grid-cols-12">
          <div className="intro-copy md:col-span-7">
            <p className="intro-lead reveal">Puppeteer 把一个真实的浏览器交到你手里。</p>
            <div className="mt-7 space-y-7">
              <p className="reveal" style={delay(60)}>
                几行代码就能让它打开页面、按下按键、读出任何一个元素。它运行在 Node.js 上，默认无头——没有窗口，也不需要显示器。
              </p>
              <p className="reveal" style={delay(100)}>
                你可以把它放进 CI，也可以放进一台没有图形界面的服务器。
              </p>
              <p className="reveal" style={delay(150)}>
                底层是 Chrome DevTools Protocol，或者 WebDriver BiDi。同一套 API 既能驱动 Chrome，也能驱动
                Firefox。
              </p>
              <p className="reveal" style={delay(200)}>
                这个站按官方文档结构逐篇翻译，覆盖全部分类，API 名称与代码保留英文原文。
              </p>
              <p className="reveal" style={delay(250)}>
                想直接动手，去<Link className="link-underline" href="/docs/installation">安装</Link>；想先弄清楚它在做什么，继续往下读。
              </p>
            </div>
          </div>

          <dl className="factlist md:col-span-4 md:col-start-9">
            {facts.map((fact, index) => (
              <div
                key={fact.term}
                className="fact reveal"
                style={delay(index * 50)}
              >
                <dt>{fact.term}</dt>
                <dd>{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3. features：2 × 2 */}
      <section className="sec bg-surface">
        <div className="shell">
          <div className="grid gap-x-10 gap-y-5 md:grid-cols-12 md:items-end">
            <h2 className="reveal text-[26px] font-medium leading-[1.12] tracking-[-0.025em] text-ink md:col-span-7 md:text-[32px]">
              它每天被用来做的四件事
            </h2>
            <p className="max-w-[36ch] text-[16px] leading-[1.6] text-ink-soft md:col-span-4 md:col-start-9">
              下面四张图不是配图，是用 Puppeteer 真的跑出来、再截下来的。
            </p>
          </div>

          <div className="mt-10 grid gap-x-8 gap-y-12 md:mt-12 md:grid-cols-2">
            {features.map((feature, index) => (
              <article key={feature.title} className="reveal" style={delay(index * 60)}>
                <div className="feature-panel">
                  <img
                    src={feature.src}
                    alt={feature.alt}
                    width={feature.width}
                    height={feature.height}
                    sizes="(max-width: 767px) 100vw, 50vw"
                    loading="lazy"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <h3 className="mt-5 text-[21px] font-medium leading-[1.28] tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="mt-2 max-w-[46ch] text-[16px] leading-[1.6] text-ink-soft">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. how-it-works */}
      <section className="how-strip" aria-labelledby="how-title">
        {steps.map((step, index) => (
          <div key={step.note} className={`how-field how-field--${step.tone}`}>
            {index === 0 && (
              <h2 id="how-title" className="how-heading">
                一次自动化
                <br />
                从头到尾
              </h2>
            )}
            <div className="how-card">
              <div className="how-card__bar">
                <span className="how-card__url">
                  {index === 0
                    ? 'about:blank'
                    : index === 1
                      ? 'developer.chrome.com'
                      : index === 2
                        ? 'devsite-search'
                        : 'browser.close()'}
                </span>
              </div>
              <div className="how-card__body">
                {index === 0 && <span className="how-blank">空白页</span>}
                {index === 1 && (
                  <div className="how-page">
                    <span className="how-page__title">Chrome for developers</span>
                    <span className="how-page__line" />
                    <span className="how-page__line how-page__line--short" />
                  </div>
                )}
                {index === 2 && (
                  <div className="how-page">
                    <span className="how-search">automate beyond recorder</span>
                    <span className="how-result">Customize and automate</span>
                    <span className="how-result how-result--dim">Chrome DevTools 指南</span>
                  </div>
                )}
                {index === 3 && <span className="how-blank how-blank--closed">已断开</span>}
              </div>
            </div>
            <p className="how-clause">{step.clause}</p>
            <p className="how-note">{step.note}</p>
          </div>
        ))}
      </section>

      {/* 5. showcase */}
      <section className="sec">
        <div className="shell">
          <CodeWalkthrough />
        </div>
      </section>

      {/* 6. stats */}
      <PixelLab />

      {/* 7. faq */}
      <section className="sec" aria-labelledby="faq-title">
        <div className="shell grid gap-x-10 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-10">
              <h2
                id="faq-title"
                className="reveal text-[clamp(2rem,1.4rem+2.4vw,2.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-ink"
              >
                常见
                <br />
                问题
              </h2>
              <p className="mt-6 max-w-[34ch] text-[16px] leading-[1.65] text-ink-soft">
                关于协议、版本、维护团队和求助渠道，先看这里。
              </p>
              <Link
                href="/faq"
                className="link-underline mt-5 inline-block text-[16px] font-medium"
              >
                全部 {faq.length} 个问题
              </Link>
            </div>
          </div>
          <div className="md:col-span-8">
            {faq.slice(0, 6).map((item, index) => (
              <details
                key={item.id}
                id={item.id}
                className="faq-tile reveal"
                name="faq"
                style={delay(index * 40)}
              >
                <summary>
                  <span>{item.question}</span>
                  <span className="faq-plus" aria-hidden="true" />
                </summary>
                <div className="faq-answer" dangerouslySetInnerHTML={{ __html: item.answer }} />
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. cta */}
      <section className="cta-wrap" aria-labelledby="cta-title">
        <div className="cta-row">
          <div className="cta-side cta-side--photo">
            <img
              src="/shots/pptr-mobile.png"
              alt="用 Puppeteer 以 390 像素宽视口截取的 pptr.dev 文档页"
              width={780}
              height={1688}
              sizes="(max-width: 900px) 50vw, 16vw"
              loading="lazy"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="cta-main">
            <h2 id="cta-title" className="cta-title">
              把手动点的那几下交出去
            </h2>
            <p className="cta-body">
              装完之后，你会先写三行代码。然后你会发现，剩下的都可以交给它了。
            </p>
            <Link className="btn btn--ink" href="/docs/installation">
              安装 Puppeteer
            </Link>
          </div>
          <div className="cta-side cta-side--flat" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
