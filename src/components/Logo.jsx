export function LogoMark({ className = "h-9 w-9", accent = "var(--color-saffron)" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M33.5 7.55A19 19 0 1 1 14.5 7.55"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M24 8c7 6 7 19 0 26-7-7-7-20 0-26Z"
        fill={accent}
        fillOpacity="0.16"
        stroke={accent}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24 13v17" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="14.5" cy="7.55" r="2.9" fill={accent} />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <span
      className={`font-display text-[1.35rem] leading-none tracking-[0.14em] uppercase ${className}`}
    >
      Kairos
    </span>
  );
}

export default function Logo({ className = "", markClass, showWord = true }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-cream ${className}`}>
      <LogoMark className={markClass || "h-8 w-8"} />
      {showWord && <Wordmark />}
    </span>
  );
}
