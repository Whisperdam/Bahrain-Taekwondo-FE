"use client";

import { useRef, useState } from "react";
import { Upload, FileIcon, X } from "lucide-react";
import { useLangStore } from "@/lib/i18n/store";
import { APPLY_STRINGS } from "@/lib/i18n/apply-strings";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPT = ["application/pdf", "image/jpeg", "image/png"];

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileDropProps {
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
  /** Optional callback when validation fails */
  onError?: (msg: string) => void;
}

export function FileDrop({ file, onFile, disabled, onError }: FileDropProps) {
  const { lang } = useLangStore();
  const t = APPLY_STRINGS[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState("");

  function pick(f: File | null | undefined) {
    setErr("");
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setErr(t.errFileTooLarge);
      onError?.(t.errFileTooLarge);
      return;
    }
    if (!ACCEPT.includes(f.type)) {
      setErr(t.errFileType);
      onError?.(t.errFileType);
      return;
    }
    onFile(f);
  }

  if (file) {
    return (
      <div className="rounded-lg border border-ink-600 bg-ink-800/70 p-3 flex items-center gap-3">
        <span className="shrink-0 w-9 h-9 rounded-md bg-flag/10 border border-flag/30 text-flag flex items-center justify-center">
          <FileIcon size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white truncate">{file.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {formatBytes(file.size)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="text-xs text-flag hover:text-flag-hover font-medium disabled:opacity-50"
        >
          {t.docChange}
        </button>
        <button
          type="button"
          onClick={() => onFile(null)}
          disabled={disabled}
          aria-label={t.docRemove}
          className="text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <X size={16} />
        </button>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={ACCEPT.join(",")}
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!disabled) pick(e.dataTransfer.files?.[0]);
        }}
        className={`cursor-pointer rounded-lg border border-dashed transition-colors p-6 text-center ${
          err
            ? "border-red-500/70"
            : drag
              ? "border-flag/60 bg-flag/5"
              : "border-ink-500 bg-ink-800/40 hover:border-ink-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="inline-flex w-10 h-10 rounded-full bg-ink-700 border border-ink-600 text-slate-400 items-center justify-center mb-3">
          <Upload size={18} />
        </div>
        <div className="text-sm text-slate-200">{t.docDropPrompt}</div>
        <div className="text-xs text-slate-500 mt-1">{t.docConstraints}</div>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={ACCEPT.join(",")}
          onChange={(e) => pick(e.target.files?.[0])}
          disabled={disabled}
        />
      </div>
      {err && (
        <div className="mt-2 text-[12px] text-red-400">{err}</div>
      )}
    </>
  );
}
