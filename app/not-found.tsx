import Link from 'next/link';

// 移植自 src/pages/404.astro。只经过根布局，因此没有 header/footer，仅保留居中的提示区。
export default function NotFound() {
  return (
    <div className="shell flex min-h-[70svh] flex-col justify-center py-20">
      <h1 className="reveal text-[clamp(2.4rem,1.4rem+5vw,6rem)] font-medium leading-[0.92] tracking-[-0.04em]">
        这个地址上没有页面
      </h1>
      <p className="reveal mt-6 max-w-[44ch] text-[16px] leading-[1.6] text-ink-soft">
        可能是链接拼错了，或者那篇还没翻译完。从文档目录重新找一遍最稳。
      </p>
      <div className="reveal mt-10 flex flex-wrap gap-x-8 gap-y-3">
        <Link href="/docs" className="btn">
          去文档目录
        </Link>
        <Link href="/" className="link-underline self-center text-[15px]">
          回到首页
        </Link>
      </div>
    </div>
  );
}
