import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/mdx-components';
import { docCategories } from '@/lib/doc-categories';
import { site } from '@/lib/site';

type Params = { slug?: string[] };

export default async function Page(props: { params: Promise<Params> }) {
  const params = await props.params;

  if (!params.slug) {
    const pages = source.getPages().sort((a, b) => a.data.order - b.data.order);
    return (
      <DocsPage toc={[]}>
        <DocsTitle>文档</DocsTitle>
        <DocsDescription>
          对应官方文档的全部分类：入门、核心概念、指南、示例、集成、社区与参考，共 {pages.length}{' '}
          篇。API 参考与更新日志体量庞大且随版本自动生成，请直接查阅官方站。
        </DocsDescription>
        <DocsBody>
          {docCategories.map((category) => {
            const items = pages.filter((page) => page.data.category === category.key);
            if (items.length === 0) return null;
            return (
              <section key={category.key}>
                <h2>{category.label}</h2>
                <p>{category.blurb}</p>
                <Cards>
                  {items.map((page) => (
                    <Card key={page.url} title={page.data.title} description={page.data.description} href={page.url} />
                  ))}
                </Cards>
              </section>
            );
          })}
        </DocsBody>
      </DocsPage>
    );
  }

  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        <p className="mt-14 text-sm text-fd-muted-foreground">
          译自{' '}
          <a href={page.data.source} target="_blank" rel="noreferrer" className="underline">
            {page.data.source.replace('https://', '')}
          </a>
          ，对应 Puppeteer v{site.version}
        </p>
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams(): Params[] {
  return [{ slug: [] }, ...source.generateParams()];
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const params = await props.params;
  if (!params.slug) {
    return { title: '文档', description: 'Puppeteer 中文文档：全部文档分类的索引。' };
  }
  const page = source.getPage(params.slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}