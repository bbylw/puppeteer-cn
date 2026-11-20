import { source } from './source';
import { faq } from './faq';

export type SearchItem = {
  title: string;
  href: string;
  kind: string;
  text: string;
};

export function getSearchItems(): SearchItem[] {
  const pages = source.getPages().sort((a, b) => a.data.order - b.data.order);
  return [
    ...pages.map((page) => ({
      title: page.data.title,
      href: page.url,
      kind: '文档',
      text: page.data.description ?? '',
    })),
    ...faq.map((item) => ({
      title: item.question,
      href: `/faq#${item.id}`,
      kind: '问答',
      text: item.answer.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '),
    })),
  ];
}