import './global.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL('https://puppeteer.ndjp.net'),
  title: {
    default: 'Puppeteer 中文文档',
    template: '%s — Puppeteer 中文文档',
  },
  description: site.description,
  icons: { icon: '/favicon.svg' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <RootProvider
          theme={{ enabled: false }}
          search={{ options: { type: 'static', api: '/api/search' } }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}