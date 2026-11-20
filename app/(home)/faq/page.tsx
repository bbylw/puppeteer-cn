import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { faq } from '@/lib/faq';
import { site } from '@/lib/site';

// reveal 动画的延迟写成 CSS 自定义属性，等价于原 Astro 的 style="--reveal-delay:…"
type StyleVars = CSSProperties & Record<`--${string}`, string>;
const delay = (ms: number): StyleVars => ({ '--reveal-delay': `${ms}ms` });

export const metadata: Metadata = {
  // 根布局的模板会补上「 — Puppeteer 中文文档」，与原 Base.astro 的 fullTitle 一致
  title: '常见问题',
  description:
    '关于 Puppeteer 的常见问题：维护团队、跨浏览器支持、CDP 与 WebDriver BiDi、与 Selenium 的关系、版本绑定、可信输入事件等。',
};

// 原 Base.astro 未指定 tone，即 light 对应的 theme-color
export const viewport = { themeColor: '#ffffff' };

export default function FaqPage() {
  return (
    <div className="shell pt-12 pb-[clamp(72px,9vw,140px)] md:pt-20">
      <header className="reveal grid gap-8 md:grid-cols-12 md:items-end">
        <h1 className="text-[clamp(2.8rem,1.4rem+6vw,7rem)] font-medium leading-[0.9] tracking-[-0.04em] md:col-span-7">
          常见问题
        </h1>
        <p className="max-w-[42ch] text-[16px] leading-[1.6] text-ink-soft md:col-span-5">
          {faq.length} 个问题，全部来自官方 FAQ。关于协议、版本、维护团队与求助渠道，先看这里。
        </p>
      </header>

      <div className="mt-[clamp(40px,6vw,80px)] max-w-[820px]">
        {faq.map((item, index) => (
          <details
            key={item.id}
            id={item.id}
            className="faq-tile reveal"
            name="faq-page"
            style={delay(index * 30)}
          >
            <summary>
              <span>{item.question}</span>
              <span className="faq-plus" aria-hidden="true" />
            </summary>
            <div className="faq-answer" dangerouslySetInnerHTML={{ __html: item.answer }} />
          </details>
        ))}
      </div>

      <div className="reveal mt-[clamp(56px,8vw,100px)] grid gap-8 md:grid-cols-12">
        <p className="u-small text-muted md:col-span-3">还有问题</p>
        <div className="md:col-span-8">
          <p className="max-w-[50ch] text-[16px] leading-[1.7]">
            官方渠道：<a className="link-underline" href="https://stackoverflow.com/questions/tagged/puppeteer" target="_blank" rel="noreferrer">Stack Overflow</a>提问题，<a className="link-underline" href={site.links.github} target="_blank" rel="noreferrer">GitHub Issues</a>报 bug。发帖前先搜一遍。
          </p>
          <p className="u-small mt-10 text-muted">
            译自 <a className="link-underline" href="https://pptr.dev/faq" target="_blank" rel="noreferrer">pptr.dev/faq</a>，对应 Puppeteer v{site.version}
          </p>
        </div>
      </div>
    </div>
  );
}
