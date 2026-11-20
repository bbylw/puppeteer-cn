'use client';

import { useEffect } from 'react';

/**
 * 移植自 src/layouts/Base.astro 的页面脚本（reveal 交叉观察、回到顶部、skip-link 聚焦）。
 * 原脚本里的 doc-body / astro-code 相关部分属于文档区，不在营销页移植范围内。
 */
export default function HomeEffects() {
  useEffect(() => {
    // --- reveal：进入视口时加上 is-in ---
    const targets = document.querySelectorAll<HTMLElement>('.reveal');
    let observer: IntersectionObserver | undefined;

    if ('IntersectionObserver' in window && targets.length) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              observer?.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
      );
      targets.forEach((el) => observer?.observe(el));
    } else {
      targets.forEach((el) => el.classList.add('is-in'));
    }

    // --- 回到顶部 ---
    const toTop = document.querySelector<HTMLButtonElement>('[data-to-top]');
    let onScroll: (() => void) | undefined;
    let onToTopClick: (() => void) | undefined;

    if (toTop) {
      const toggleToTop = () => {
        const show = window.scrollY > 600;
        toTop.classList.toggle('is-visible', show);
        toTop.tabIndex = show ? 0 : -1;
      };
      onScroll = toggleToTop;
      window.addEventListener('scroll', toggleToTop, { passive: true });
      toggleToTop();

      onToTopClick = () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      };
      toTop.addEventListener('click', onToTopClick);
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
      observer?.disconnect();
      if (onScroll) window.removeEventListener('scroll', onScroll);
      if (toTop && onToTopClick) toTop.removeEventListener('click', onToTopClick);
      if (skip && onSkipFocus) skip.removeEventListener('focus', onSkipFocus);
      if (skip && onSkipBlur) skip.removeEventListener('blur', onSkipBlur);
    };
  }, []);

  return null;
}
