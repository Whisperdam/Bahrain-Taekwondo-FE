interface ShieldLogoProps {
  size?: number;
}

/**
 * Shield silhouette uses `currentColor` (not a hardcoded white) so it stays
 * legible when placed on a light surface — wrap with a `text-*` class to set
 * it, e.g. `text-white` (default, correct on dark themes) or an explicit
 * dark token where the logo sits on a light-theme white surface. The red
 * kick-mark stays the fixed brand color — a logo mark, not a themed surface.
 */
export function ShieldLogo({ size = 44 }: ShieldLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="text-white"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 L42 9 V23 C42 33.5 34.5 41.5 24 45 C13.5 41.5 6 33.5 6 23 V9 Z"
        fill="url(#shieldGrad)"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1"
      />
      <path
        d="M16 19 L20 22 L16 25 L20 28 L16 31 L32 31 L32 19 Z"
        fill="#CE1126"
      />
      <path
        d="M24 3 L42 9 V13 C36 11 30 10 24 10 C18 10 12 11 6 13 V9 Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}
