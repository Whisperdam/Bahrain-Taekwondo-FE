"use client";

import { toast } from "sonner";
import { format } from "date-fns";
import { FileIcon, ExternalLink } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import { getDocumentUrl } from "@/lib/applications/api";
import type { DocumentSummary } from "@/types/applications";

/** Uploaded documents of an application or player, each openable via a presigned URL. */
export function DocumentsCard({
  documents,
  t,
}: {
  documents: DocumentSummary[];
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
}) {
  return (
    <section className="bg-ink-700 border border-ink-600/70 rounded-xl p-6">
      <SectionHeader title={t.documents} />
      {documents.length === 0 ? (
        <div className="text-sm text-slate-500 italic">—</div>
      ) : (
        <div className="space-y-2.5">
          {documents.map((d) => (
            <div
              key={d.documentId}
              className="flex items-center gap-3 p-3.5 bg-ink-800/40 border border-ink-600/70 rounded-lg"
            >
              <span className="w-10 h-10 rounded-md bg-flag/10 border border-flag/30 text-flag flex items-center justify-center shrink-0">
                <FileIcon size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">
                  {d.fileName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{d.documentType}</span>
                  <span className="text-slate-600">·</span>
                  <span className="tabular-nums">
                    {(d.fileSizeBytes / 1024).toFixed(0)} KB
                  </span>
                  <span className="text-slate-600">·</span>
                  <span>{format(new Date(d.uploadedAt), "PP")}</span>
                </div>
              </div>
              <SecondaryButton
                className="shrink-0 !py-2 !px-3 text-xs"
                onClick={async () => {
                  try {
                    // Fetch the presigned URL via the auth-aware api client, then open it in a new tab.
                    const { url } = await getDocumentUrl(d.documentId);
                    if (url) window.open(url, "_blank", "noopener,noreferrer");
                  } catch {
                    toast.error(t.toastAppActionFailed);
                  }
                }}
              >
                <ExternalLink size={14} />
                {t.preview}
              </SecondaryButton>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
