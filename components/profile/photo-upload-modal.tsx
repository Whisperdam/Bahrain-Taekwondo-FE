"use client";

import { useRef, useState } from "react";
import { Upload, FileIcon, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Avatar } from "@/components/ui/avatar";
import { useLangStore } from "@/lib/i18n/store";
import { PORTAL_STRINGS } from "@/lib/i18n/portal-strings";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPT = ["image/jpeg", "image/png"];

interface PhotoUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
  initials?: string;
}

export function PhotoUploadModal({
  open,
  onClose,
  onUpload,
  uploading,
  initials,
}: PhotoUploadModalProps) {
  const { lang } = useLangStore();
  const t = PORTAL_STRINGS[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState("");

  function reset() {
    setFile(null);
    setPreview(null);
    setErr("");
  }

  function close() {
    if (uploading) return;
    reset();
    onClose();
  }

  function pick(f?: File | null) {
    setErr("");
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setErr(t.errPhotoSize);
      return;
    }
    if (!ACCEPT.includes(f.type)) {
      setErr(t.errPhotoType);
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleUpload() {
    if (!file) return;
    await onUpload(file);
    reset();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={t.photoUpload}
      size="md"
      dismissible={!uploading}
      footer={
        <>
          <SecondaryButton onClick={close} disabled={uploading}>
            {t.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            loading={uploading}
            loadingText={t.photoUploading}
            className="w-auto px-4"
          >
            {t.photoUpload}
          </PrimaryButton>
        </>
      }
    >
      {/* Preview */}
      <div className="flex justify-center mb-5">
        <div className="relative">
          {preview ? (
            <Avatar photoUrl={preview} size={160} alt="" />
          ) : (
            <Avatar initials={initials} size={160} />
          )}
          {preview && (
            <button
              type="button"
              onClick={reset}
              disabled={uploading}
              className="absolute -top-1 ltr:-right-1 rtl:-left-1 w-8 h-8 rounded-full bg-ink-700 border border-ink-600 text-slate-300 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
              aria-label="Clear preview"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {!file && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !uploading) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={`cursor-pointer rounded-lg border border-dashed transition-colors p-6 text-center ${
            err
              ? "border-red-500/70"
              : drag
                ? "border-flag/60 bg-flag/5"
                : "border-ink-500 bg-ink-800/40 hover:border-ink-400"
          }`}
        >
          <div className="inline-flex w-10 h-10 rounded-full bg-ink-700 border border-ink-600 text-slate-400 items-center justify-center mb-3">
            <Upload size={18} />
          </div>
          <div className="text-sm text-slate-200">{t.photoDropPrompt}</div>
          <div className="text-xs text-slate-500 mt-1">{t.photoConstraints}</div>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={ACCEPT.join(",")}
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>
      )}

      {file && (
        <div className="rounded-lg border border-ink-600 bg-ink-800/70 p-3 flex items-center gap-3">
          <span className="shrink-0 w-9 h-9 rounded-md bg-flag/10 border border-flag/30 text-flag flex items-center justify-center">
            <FileIcon size={16} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{file.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {(file.size / 1024).toFixed(0)} KB
            </div>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs text-flag hover:text-flag-hover font-medium disabled:opacity-50"
          >
            {t.photoChange}
          </button>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={ACCEPT.join(",")}
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>
      )}
      {err && <div className="mt-2 text-[12px] text-red-400">{err}</div>}
    </Modal>
  );
}
