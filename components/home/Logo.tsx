type Props = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 24, className = '' }: Props) {
  return (
    <svg
      className={['logo-mark', className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.6 2.6 17.4 10.2M17.4 2.6 6.6 10.2"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="square"
      />
      <rect x="3.6" y="11.6" width="16.8" height="9.8" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
