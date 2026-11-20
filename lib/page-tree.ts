import type { Root } from 'fumadocs-core/page-tree';
import { source } from './source';
import { docCategories } from './doc-categories';
import { site } from './site';

export function getDocsTree(): Root {
  const pages = source.getPages().sort((a, b) => a.data.order - b.data.order);

  return {
    name: '文档',
    children: [
      ...docCategories.map((category) => ({
        type: 'folder' as const,
        name: category.label,
        defaultOpen: true,
        children: pages
          .filter((page) => page.data.category === category.key)
          .map((page) => ({
            type: 'page' as const,
            name: page.data.title,
            url: page.url,
          })),
      })),
      { type: 'separator' as const, name: '更多' },
      { type: 'page' as const, name: '常见问题', url: '/faq' },
      { type: 'page' as const, name: 'API 参考', url: site.links.api, external: true },
      {
        type: 'page' as const,
        name: '更新日志',
        url: 'https://pptr.dev/CHANGELOG',
        external: true,
      },
    ],
  };
}