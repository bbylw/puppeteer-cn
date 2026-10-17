import { useEffect, useMemo, useRef, useState } from 'react';

export type SearchItem = {
  title: string;
  href: string;
  kind: string;
  text: string;
};

type Props = { items: SearchItem[] };

export default function SearchDialog({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 6);
    return items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) || item.text.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [items, query]);

  return (
    <>
      <button
        type="button"
        className="search-trigger"
        onClick={() => setOpen(true)}
        aria-label="搜索文档"
      >
        <span className="search-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="6.8" cy="6.8" r="4.6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.4 10.4L14 14" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
        <span className="search-label">搜索</span>
        <kbd>⌘K</kbd>
      </button>

      {open && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="搜索">
          <button
            type="button"
            className="search-backdrop"
            aria-label="关闭搜索"
            onClick={() => setOpen(false)}
          />
          <div className="search-panel">
            <div className="search-field">
              <input
                ref={inputRef}
                type="search"
                value={query}
                placeholder="搜索文档与问题"
                onChange={(event) => setQuery(event.currentTarget.value)}
                aria-label="搜索关键词"
              />
              <button type="button" onClick={() => setOpen(false)} aria-label="关闭">
                关闭
              </button>
            </div>

            <ul className="search-results">
              {results.map((item) => (
                <li key={item.href + item.title}>
                  <a href={item.href} onClick={() => setOpen(false)}>
                    <span className="search-kind">{item.kind}</span>
                    <span className="search-title">{item.title}</span>
                  </a>
                </li>
              ))}
              {results.length === 0 && (
                <li className="search-empty">
                  没有匹配「{query}」的内容。换一个词试试。
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
