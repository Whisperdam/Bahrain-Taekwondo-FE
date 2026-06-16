import { cn } from "@/lib/utils";

interface AvatarProps {
  initials?: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
  alt?: string;
}

/**
 * Square-circular avatar. If `photoUrl` is supplied, renders the image.
 * Otherwise falls back to initials on a flag-red tinted background.
 */
export function Avatar({
  initials,
  photoUrl,
  size = 32,
  className,
  alt,
}: AvatarProps) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.max(11, Math.floor(size * 0.35)),
  };

  if (photoUrl) {
    return (
      <span
        className={cn(
          "inline-block rounded-full overflow-hidden border border-ink-600 bg-ink-800 shrink-0",
          className,
        )}
        style={style}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={alt ?? ""}
          className="w-full h-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-flag/20 border border-flag/40 text-flag font-semibold shrink-0",
        className,
      )}
      style={style}
      aria-label={alt}
    >
      {initials?.toUpperCase()}
    </span>
  );
}
