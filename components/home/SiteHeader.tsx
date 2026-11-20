'use client';

import type { SearchItem } from '@/lib/search-items';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { nav, site } from '@/lib/site';
import Logo from './Logo';
import SearchDialog from './SearchDialog';

type Props = {
  items: SearchItem[];
};

export default function SiteHeader({ items }: Props) {
  const pathname = usePathname() ?? '/';
  // trailingSlash: true 时路径带尾斜杠，去掉后才能和 nav 里的 href 比较（对应原 Astro.url.pathname）
  const current = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  // 原 Base.astro 的 tone 属性：首页 dark，其余页面 light
  const tone: 'light' | 'dark' = current === '/' ? 'dark' : 'light';
  const dark = tone === 'dark';

  return (
    <header
      className={`site-header relative z-40 ${dark ? 'bg-field-1 text-white' : 'bg-bg text-ink'}`}
      data-tone={tone}
    >
      <div className="shell flex h-[68px] items-center gap-4 md:h-[76px]">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Puppeteer 首页">
          <Logo size={24} />
          <span className="wordmark text-[19px] font-medium tracking-[-0.03em] md:text-[21px]">
            Puppeteer
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 md:flex" aria-label="主导航">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`u-small link-plain ${current === item.href ? 'is-current' : ''} ${
                dark ? 'text-white/80 hover:text-white' : 'text-ink/75 hover:text-ink'
              }`}
              aria-current={current === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.links.github}
            target="_blank"
            rel="noreferrer"
            className={`u-small link-plain ${
              dark ? 'text-white/80 hover:text-white' : 'text-ink/75 hover:text-ink'
            }`}
          >
            GitHub
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <SearchDialog items={items} />

          <details className="mobile-menu md:hidden">
            <summary
              className={`u-small flex h-9 cursor-pointer list-none items-center px-3 [&::-webkit-details-marker]:hidden ${
                dark ? 'bg-white/10 text-white' : 'bg-surface text-ink'
              }`}
            >
              菜单
            </summary>
            <nav
              className={`absolute left-2 right-2 top-[64px] z-50 flex flex-col p-2 ${
                dark ? 'bg-[#111620] text-white' : 'bg-surface text-ink'
              }`}
              aria-label="移动导航"
            >
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="u-small px-4 py-3">
                  {item.label}
                </Link>
              ))}
              <a
                href={site.links.github}
                target="_blank"
                rel="noreferrer"
                className="u-small px-4 py-3"
              >
                GitHub
              </a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
