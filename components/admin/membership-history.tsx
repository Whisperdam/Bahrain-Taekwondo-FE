"use client";

import { format } from "date-fns";
import { History } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import type { PeopleStrings } from "@/lib/i18n/people-strings";
import type { MembershipEvent } from "@/types/admin";

/** Who joined, left or was released from which academy, newest first. For admins checking a transfer. */
export function MembershipHistory({
  events,
  loading,
  failed,
  t,
}: {
  events: MembershipEvent[] | undefined;
  loading: boolean;
  failed: boolean;
  t: PeopleStrings;
}) {
  return (
    <section className="bg-ink-700 border border-flag/30 rounded-xl p-6">
      <SectionHeader title={t.historyTitle} />
      {loading && <Skeleton width="100%" height={64} />}
      {failed && <p className="text-sm text-red-300">{t.privateLoadFailed}</p>}
      {events && events.length === 0 && <p className="text-sm text-slate-500 italic">{t.historyEmpty}</p>}
      {events && events.length > 0 && (
        <ul className="divide-y divide-ink-600/50">
          {events.map((e) => (
            <li key={e.eventId} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
              <History size={14} className="text-slate-500 shrink-0" aria-hidden="true" />
              <span className="text-white">{t.event(e.kind, e.academyName)}</span>
              {e.detail && <span className="text-xs text-slate-400">{e.detail}</span>}
              <span className="ms-auto text-xs text-slate-500 tabular-nums">
                {e.actorName ? `${t.byActor(e.actorName)} · ` : ""}
                {format(new Date(e.createdAt), "PPp")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
