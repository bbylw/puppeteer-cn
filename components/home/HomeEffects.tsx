'use client';

import { useEffect } from 'react';

/**
 * 首页增强脚本。遵循 modern-web-guidance：
 * - reveal 入场动画优先交给 CSS 滚动驱动动画（animation-timeline: view()），
 *   仅在不支持的浏览器里回退到 IntersectionObserver；
 * - 回到顶部按钮优先用 CSS scroll-state 容器查询控制显隐，
 *   不支持时用哨兵元素 + IntersectionObserver 切换 .scrolled，不再挂 scroll 监听。
 */
export default function HomeEffects() {
  useEffect(() => {
    // --- reveal：CSS 滚动驱动动画不可用时的回退 ---
    const supportsViewTimeline =
      CSS.supports('animation-timeline: view()') &&
      CSS.supports('animation-range: entry');
    const targets = document.querySelectorAll<HTMLElement>('.reveal');
    let revealObserver: IntersectionObserver | undefined;

    if (!supportsViewTimeline && targets.length) {
      if ('IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-in');
                revealObserver?.unobserve(entry.target);
              }
            }
          },
          { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
        );
        targets.forEach((el) => revealObserver?.observe(el));
      } else {
        targets.forEach((el) => el.classList.add('is-in'));
      }
    }

    // --- 回到顶部 ---
    const toTop = document.querySelector<HTMLButtonElement>('[data-to-top]');
    let topObserver: IntersectionObserver | undefined;
    let onToTopClick: (() => void) | undefined;
    let onToTopFocusOut: ((event: FocusEvent) => void) | undefined;

    if (toTop) {
      if (!CSS.supports('container-type: scroll-state')) {
        const sentinel = document.querySelector('[data-scroll-sentinel]');
        if ('IntersectionObserver' in window && sentinel) {
          topObserver = new IntersectionObserver(([entry]) => {
            document.documentElement.classList.toggle(
              'scrolled',
              !entry.isIntersecting
            );
          });
          topObserver.observe(sentinel);
        } else {
          // 基础回退：无法感知滚动位置时让按钮始终可见
          document.documentElement.classList.add('scrolled');
        }
      }

      onToTopClick = () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      };
      // 按钮随滚动隐藏而失去焦点时（如按 Home 键），把焦点交回主内容区，
      // 避免焦点落回 <body>。
      onToTopFocusOut = (event: FocusEvent) => {
        if (
          !event.relatedTarget &&
          getComputedStyle(toTop).visibility === 'hidden'
        ) {
          document.getElementById('main')?.focus();
        }
      };
      toTop.addEventListener('click', onToTopClick);
      toTop.addEventListener('focusout', onToTopFocusOut);
    }

    // --- skip-link 聚焦时移入可视区 ---
    const skip = document.querySelector<HTMLAnchorElement>('.skip-link');
    let onSkipFocus: (() => void) | undefined;
    let onSkipBlur: (() => void) | undefined;

    if (skip) {
      onSkipFocus = () => {
        skip.style.left = '12px';
        skip.style.top = '12px';
      };
      onSkipBlur = () => {
        skip.style.left = '-9999px';
      };
      skip.addEventListener('focus', onSkipFocus);
      skip.addEventListener('blur', onSkipBlur);
    }

    return () => {
      revealObserver?.disconnect();
      topObserver?.disconnect();
      document.documentElement.classList.remove('scrolled');
      if (toTop && onToTopClick) toTop.removeEventListener('click', onToTopClick);
      if (toTop && onToTopFocusOut) toTop.removeEventListener('focusout', onToTopFocusOut);
      if (skip && onSkipFocus) skip.removeEventListener('focus', onSkipFocus);
      if (skip && onSkipBlur) skip.removeEventListener('blur', onSkipBlur);
    };
  }, []);

  return null;
}