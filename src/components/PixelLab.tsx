import { useState } from 'react';

const MIN = 390;
const MAX = 2560;

export default function PixelLab() {
  const [width, setWidth] = useState(1440);
  const height = Math.round((width * 10) / 16);
  const megapixels = (width * height) / 1_000_000;
  const frameMb = (width * height * 4) / (1024 * 1024);

  return (
    <section
      className="bg-field-1 text-white"
      aria-labelledby="pixel-title"
    >
      <div className="shell flex min-h-[66svh] flex-col justify-between gap-12 py-[clamp(56px,7vw,96px)]">
        <div>
          <h2
            id="pixel-title"
            className="max-w-[18ch] text-[clamp(26px,3vw,44px)] font-medium leading-[1.06] tracking-[-0.03em]"
          >
            一次截图，有多少像素？
          </h2>

          <div className="mt-10 w-full max-w-[420px]">
            <div className="flex items-baseline justify-between gap-4 text-[14px] text-white/60">
              <label htmlFor="viewport-width">视口宽度</label>
              <span className="font-display tabular-nums text-white">
                {width} × {height}
              </span>
            </div>
            <input
              id="viewport-width"
              className="pixel-range mt-4 w-full"
              type="range"
              min={MIN}
              max={MAX}
              step={10}
              value={width}
              onChange={(event) => setWidth(Number(event.currentTarget.value))}
              aria-valuetext={`${width} × ${height} 像素`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <p className="flex items-baseline gap-4">
            <span className="text-[clamp(84px,14.4vw,232px)] font-medium leading-[0.78] tracking-[-0.04em] tabular-nums">
              {megapixels.toFixed(2)}
            </span>
            <span className="text-[26px] leading-none text-white/70">
              百万像素
            </span>
          </p>
          <p className="max-w-[34ch] pb-2 text-[16px] leading-[1.65] text-white/60">
            {width} × {height} × 4 字节 = {frameMb.toFixed(2)} MB
            的未压缩帧缓冲。page.screenshot() 默认输出 PNG，体积通常只有它的几分之一。
          </p>
        </div>
      </div>
    </section>
  );
}
