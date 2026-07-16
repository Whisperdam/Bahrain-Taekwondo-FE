import * as React from "react";
import { cn } from "@/lib/utils";

function Spinner() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      className="spinner"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function PrimaryButton({
  loading,
  loadingText,
  disabled,
  children,
  className,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={cn(
        "w-full bg-flag hover:bg-flag-hover disabled:opacity-60 disabled:cursor-not-allowed text-accent-foreground text-sm font-semibold rounded-lg py-2.5 px-4 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-700 focus:ring-flag",
        className,
      )}
      {...props}
    >
      {/* children render directly (not wrapped in a span) so multi-element
          children like `<span>Next</span><ChevronIcon/>` stay laid out by
          the button's own flex row instead of collapsing into inline text
          that can wrap the icon onto its own line. */}
      {loading ? (
        <>
          <Spinner />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
}
