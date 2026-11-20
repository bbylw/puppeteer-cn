import Link from 'next/link';
import { site } from '@/lib/site';
import Logo from './Logo';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-field-2 text-ink">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-end md:gap-12">
          <div className="flex items-center gap-2.5">
            <Logo size={22} />
            <p className="u-small max-w-[26em] leading-relaxed">
              Puppeteer
              <br />
              非官方译本，内容译自 pptr.dev
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-2 md:justify-center"
            aria-label="页脚导航"
          >
            <Link href="/docs" className="u-small link-underline">
              文档
            </Link>
            <a
              href={site.links.api}
              target="_blank"
              rel="noreferrer"
              className="u-small link-underline"
            >
              API
            </a>
            <Link href="/faq" className="u-small link-underline">
              常见问题
            </Link>
            <a
              href={site.links.contributing}
              target="_blank"
              rel="noreferrer"
              className="u-small link-underline"
            >
              贡献指南
            </a>
            <a
              href={site.links.troubleshooting}
              target="_blank"
              rel="noreferrer"
              className="u-small link-underline"
            >
              故障排查
            </a>
          </nav>

          <p className="u-small text-ink/80 md:text-right">
            {year} · 对应 Puppeteer v{site.version}
          </p>
        </div>
      </div>
    </footer>
  );
}
