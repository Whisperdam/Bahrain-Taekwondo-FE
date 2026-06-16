"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number; // 0-indexed
  totalPages: number;
  onChange: (page: number) => void;
  showingText?: string;
  pageOfText?: string;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  showingText,
  pageOfText,
}: PaginationProps) {
  if (totalPages <= 1 && !showingText) return null;

  return (
    <div className="mt-4 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-500">
      <div>{showingText}</div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onChange(Math.max(0, page - 1))}
          className="px-2 py-1.5 rounded-md text-slate-300 hover:bg-ink-700 hover:text-flag disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-300 transition-colors"
          aria-label="Previous page"
        >
          <span className="rtl:rotate-180 inline-flex">
            <ChevronLeft size={14} />
          </span>
        </button>
        <span className="px-2.5 py-1 text-slate-300 tabular-nums">
          {pageOfText ?? `${page + 1} / ${totalPages}`}
        </span>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
          className="px-2 py-1.5 rounded-md text-slate-300 hover:bg-ink-700 hover:text-flag disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-300 transition-colors"
          aria-label="Next page"
        >
          <span className="rtl:rotate-180 inline-flex">
            <ChevronRight size={14} />
          </span>
        </button>
      </div>
    </div>
  );
}
