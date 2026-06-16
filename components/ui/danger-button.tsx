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

interface DangerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Destructive action button (reject, delete, suspend). Uses ink-tinted
 * outline + red text rather than a solid red fill so it reads as serious
 * without competing with the brand-red PrimaryButton.
 */
export function DangerButton({
  loading,
  loadingText,
  disabled,
  children,
  className,
  ...props
}: DangerButtonProps) {
  return (
    <button
      type="button"
      disabled={loading || disabled}
      className={cn(
        "bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 hover:border-red-500/60 text-red-300 hover:text-red-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold rounded-lg py-2.5 px-4 transition-colors inline-flex items-center justify-center gap-2",
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}
