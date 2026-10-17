import { useState } from 'react';

const DEFAULTS = {
  weight: 500,
  tracking: -3,
  leading: 96,
};

type Control = {
  id: 'weight' | 'tracking' | 'leading';
  label: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
};

const CONTROLS: Control[] = [
  {
    id: 'weight',
    label: '字重',
    min: 300,
    max: 700,
    step: 50,
    format: (v) => String(v),
  },
  {
    id: 'tracking',
    label: '字距',
    min: -8,
    max: 16,
    step: 1,
    format: (v) => `${(v / 100).toFixed(2)}em`,
  },
  {
    id: 'leading',
    label: '行距',
    min: 82,
    max: 132,
    step: 2,
    format: (v) => (v / 100).toFixed(2),
  },
];

export default function HeroStage() {
  const [values, setValues] = useState(DEFAULTS);

  const titleStyle = {
    fontWeight: values.weight,
    letterSpacing: `${values.tracking / 100}em`,
    lineHeight: values.leading / 100,
  };

  return (
    <div className="hero-stage">
      <h1 className="hero-title" style={titleStyle}>
        <span className="hero-line">
          <span className="hero-line__in">操纵浏览器</span>
        </span>
        <span className="hero-line">
          <span className="hero-line__in">只要几行代码</span>
        </span>
      </h1>

      <div
        className="hero-console"
        role="group"
        aria-label="实时调整标题的排版参数"
      >
        {CONTROLS.map((control, index) => {
          const value = values[control.id];
          const tilt = [-2, 1.4, -1][index] ?? 0;
          return (
            <label
              key={control.id}
              className="hero-chip"
              style={{ rotate: `${tilt}deg` }}
            >
              <span className="hero-chip__head">
                <span className="hero-chip__label">{control.label}</span>
                <span className="hero-chip__value">{control.format(value)}</span>
              </span>
              <input
                className="hero-range"
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={value}
                onChange={(event) => {
                  const next = Number(event.currentTarget.value);
                  setValues((prev) => ({ ...prev, [control.id]: next }));
                }}
                aria-label={`调整${control.label}`}
              />
            </label>
          );
        })}
      </div>

      <button
        type="button"
        className="hero-reset"
        onClick={() => setValues(DEFAULTS)}
      >
        恢复初始排版
      </button>
    </div>
  );
}
