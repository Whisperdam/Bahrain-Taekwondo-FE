"use client";

import { AlertTriangle } from "lucide-react";
import { SecondaryButton } from "./secondary-button";

interface ErrorStateProps {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}

/**
 * Inline table-card error state with a retry action. Used by list pages so an
 * API failure is clearly distinguishable from a legitimate empty result.
 */
export function ErrorState({ message, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <div className="p-12 text-center">
      <div className="inline-flex w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 items-center justify-center mb-3">
        <AlertTriangle size={22} />
      </div>
      <p className="text-sm text-slate-400 mb-4">{message}</p>
      <SecondaryButton onClick={onRetry}>{retryLabel}</SecondaryButton>
    </div>
  );
}
