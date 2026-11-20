import type { CSSProperties, ReactNode } from 'react';
import HomeEffects from '@/components/home/HomeEffects';
import SiteHeader from '@/components/home/SiteHeader';
import SiteFooter from '@/components/home/SiteFooter';
import '@/components/home/home.css';
import { getSearchItems } from '@/lib/search-items';

// 原 Base.astro 里 skip-link 的内联 style
const skipLinkStyle: CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: 0,
  zIndex: 100,
  background: 'var(--color-accent)',
  color: 'var(--color-ink)',
  padding: '12px 18px',
};

export default function HomeLayout({ children }: { children: ReactNode }) {
  const searchItems = getSearchItems();

  return (
    <>
      {/* 原 Base.astro <head> 里的字体预加载 */}
      <link
        rel="preload"
        href="/fonts/clash-grotesk-500.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      {/* 原 Base.astro 的 is:inline 脚本：尽早把 no-js 换成 js，避免 reveal 元素闪烁 */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js');",
        }}
      />

      {/* 滚动哨兵：不支持 scroll-state 容器查询的浏览器用 IO 观察它来显隐回到顶部按钮 */}
      <div className="scroll-sentinel" data-scroll-sentinel="" aria-hidden="true" />
      <a href="#main" className="skip-link u-small" style={skipLinkStyle}>
        跳到主要内容
      </a>
      <SiteHeader items={searchItems} />
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter />

      <button
        type="button"
        className="to-top"
        data-to-top=""
        aria-label="回到顶部"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M9 15V3.6M9 3.6 3.8 8.8M9 3.6l5.2 5.2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="square"
          />
        </svg>
      </button>

      <HomeEffects />
    </>
  );
}
