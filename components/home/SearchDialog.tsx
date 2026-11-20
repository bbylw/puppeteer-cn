'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { SearchItem } from '@/lib/search-items';

type Props = { items: SearchItem[] };

export default function SearchDialog({ items }: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');

  const openDialog = () => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    }
  };

  const closeDialog = () => dialogRef.current?.close();

  // ⌘K / Ctrl+K 开关；Esc 与焦点圈定由原生 <dialog> 的模态态负责
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (dialog.open) {
          dialog.close();
        } else {
          dialog.showModal();
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // closedby="any" 的渐进增强回退（Safari 尚不支持）：
  // 用指针位置判断“点在对话框外”，按下与抬起都在外部才关闭，避免文本选择拖拽误关。
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
    const outside = (event: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };
    let pressedOutside = false;
    const onDown = (event: PointerEvent) => {
      pressedOutside = outside(event);
    };
    const onUp = (event: PointerEvent) => {
      if (pressedOutside && outside(event)) dialog.close();
    };
    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

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
        onClick={openDialog}
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

      <dialog
        ref={dialogRef}
        className="search-dialog"
        closedby="any"
        aria-label="搜索"
        onClose={() => setQuery('')}
      >
        <search>
          <div className="search-field">
            <input
              ref={inputRef}
              type="search"
              value={query}
              placeholder="搜索文档与问题"
              onChange={(event) => setQuery(event.currentTarget.value)}
              aria-label="搜索关键词"
              autoFocus
            />
            <button type="button" onClick={closeDialog}>
              关闭
            </button>
          </div>

          <ul className="search-results" role="list">
            {results.map((item) => (
              <li key={item.href + item.title}>
                <Link href={item.href} onClick={closeDialog}>
                  <span className="search-kind">{item.kind}</span>
                  <span className="search-title">{item.title}</span>
                </Link>
              </li>
            ))}
            {results.length === 0 && (
              <li className="search-empty">
                没有匹配「{query}」的内容。换一个词试试。
              </li>
            )}
          </ul>
        </search>
      </dialog>
    </>
  );
}