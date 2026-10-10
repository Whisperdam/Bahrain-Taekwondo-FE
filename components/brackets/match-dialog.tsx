"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { ArrowLeftRight, Radio } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { cn } from "@/lib/utils";
import { CornerBadge, activeCorner } from "@/components/brackets/corner-badge";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  correctMatchResult,
  setMatchResult,
  startMatch,
  swapMatchCorners,
  undoMatchResult,
} from "@/lib/brackets/api";
import type { BracketStrings } from "@/lib/i18n/bracket-strings";
import type { BracketMatch, BracketPlayer, ResultType } from "@/types/bracket";

const RESULT_TYPES: ResultType[] = [
  "POINTS",
  "GOLDEN_POINT",
  "KNOCKOUT",
  "DISQUALIFICATION",
  "WALKOVER",
];

interface MatchDialogProps {
  /** The latest copy of the match; it updates as the bracket is refreshed. */
  match: BracketMatch;
  t: BracketStrings;
  onClose: () => void;
  /** Called after any change (and after a conflict) so the bracket reloads. */
  onChanged: () => void;
}

function parseScore(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 999 ? n : null;
}

export function MatchDialog({ match, t, onClose, onChanged }: MatchDialogProps) {
  const decided = match.status === "COMPLETED";
  const players = [match.player1, match.player2].filter((p): p is BracketPlayer => !!p);

  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [resultType, setResultType] = useState<ResultType>("POINTS");
  const [changing, setChanging] = useState(false);
  const [confirmUndo, setConfirmUndo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const winner = players.find((p) => p.playerId === match.winnerId) ?? null;
  const editing = !decided || changing;

  function finish(message: string) {
    toast.success(message);
    onChanged();
    onClose();
  }

  function fail(err: unknown) {
    setError(getApiErrorMessage(err, t.actionFailed));
    // Someone else may have changed the match: reload so the dialog shows the truth.
    if (isAxiosError(err) && (err.response?.status === 409 || err.response?.status === 422)) {
      onChanged();
    }
  }

  const body = () => ({
    winnerId: winnerId!,
    player1Score: parseScore(score1),
    player2Score: parseScore(score2),
    resultType,
  });

  const start = useMutation({
    mutationFn: () => startMatch(match.matchId),
    onSuccess: () => finish(t.matchStarted),
    onError: fail,
  });
  const save = useMutation({
    mutationFn: () =>
      decided
        ? correctMatchResult(match.matchId, { ...body(), expectedWinnerId: match.winnerId! })
        : setMatchResult(match.matchId, body()),
    onSuccess: () => finish(t.resultSaved),
    onError: fail,
  });
  const undo = useMutation({
    mutationFn: () => undoMatchResult(match.matchId, match.winnerId!),
    onSuccess: () => finish(t.resultUndone),
    onError: fail,
  });

  const swap = useMutation({
    mutationFn: () => swapMatchCorners(match.matchId),
    onSuccess: () => {
      toast.success(t.cornersSwapped);
      onChanged();
    },
    onError: fail,
  });

  const busy = start.isPending || save.isPending || undo.isPending || swap.isPending;
  const canSave = winnerId != null && winnerId !== (decided ? match.winnerId : -1) && !busy;
  const live = match.status === "IN_PROGRESS";

  return (
    <Modal
      open
      onClose={() => !busy && onClose()}
      title={t.matchResultTitle(match.matchNumber ?? "")}
      dismissible={!busy}
      footer={
        <>
          {decided && !changing && (
            <>
              <SecondaryButton onClick={() => setConfirmUndo(true)} disabled={busy}>
                {t.undoResult}
              </SecondaryButton>
              <PrimaryButton
                type="button"
                className="w-auto px-4"
                onClick={() => setChanging(true)}
                disabled={busy}
              >
                {t.changeWinner}
              </PrimaryButton>
            </>
          )}
          {editing && (
            <>
              {!decided && match.status === "READY" && (
                <SecondaryButton
                  onClick={() => {
                    setError(null);
                    start.mutate();
                  }}
                  disabled={busy}
                >
                  <Radio size={14} />
                  {t.markLive}
                </SecondaryButton>
              )}
              <SecondaryButton onClick={onClose} disabled={busy}>
                {t.cancel}
              </SecondaryButton>
              <PrimaryButton
                type="button"
                className="w-auto px-4"
                disabled={!canSave}
                loading={save.isPending}
                loadingText={t.saving}
                onClick={() => {
                  setError(null);
                  save.mutate();
                }}
              >
                {t.save}
              </PrimaryButton>
            </>
          )}
        </>
      }
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {live && (
        <div className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-flag">
          <span className="w-1.5 h-1.5 rounded-full bg-flag animate-pulse" aria-hidden="true" />
          {t.isLive}
        </div>
      )}

      {decided && !changing && winner && (
        <p className="text-sm text-slate-200 mb-1">{t.decided(winner.name)}</p>
      )}

      {editing && (
        <>
          <div className="text-[11px] font-medium tracking-[0.14em] uppercase text-slate-400 mb-2">
            {t.whoWon}
          </div>
          <div className="grid grid-cols-1 gap-2 mb-4">
            {players.map((p) => {
              const corner = activeCorner(match, p.playerId === match.player1?.playerId ? 1 : 2);
              return (
                <button
                  key={p.playerId}
                  type="button"
                  onClick={() => setWinnerId(p.playerId)}
                  aria-pressed={winnerId === p.playerId}
                  className={cn(
                    "text-start rounded-lg border px-4 py-3 transition-colors",
                    winnerId === p.playerId
                      ? "border-flag bg-flag/10"
                      : "border-ink-600 bg-ink-800/60 hover:border-ink-500",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{t.wins(p.name)}</div>
                      {p.academyName && <div className="text-xs text-slate-500">{p.academyName}</div>}
                    </div>
                    {corner && <CornerBadge corner={corner} t={t} />}
                  </div>
                </button>
              );
            })}
          </div>
          {!decided && match.status === "READY" && match.player1Corner && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                swap.mutate();
              }}
              disabled={busy}
              className="mb-4 -mt-2 inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white disabled:opacity-60"
            >
              <ArrowLeftRight size={14} />
              {t.swapCorners}
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            {players.map((p, i) => (
              <Field key={p.playerId} id={`score-${i}`} label={`${p.name} · ${t.scores}`}>
                <Input
                  id={`score-${i}`}
                  inputMode="numeric"
                  value={i === 0 ? score1 : score2}
                  onChange={(e) => (i === 0 ? setScore1 : setScore2)(e.target.value.replace(/\D/g, "").slice(0, 3))}
                />
              </Field>
            ))}
          </div>
          <Field id="result-type" label={t.resultType}>
            <Select
              id="result-type"
              value={resultType}
              onChange={(e) => setResultType(e.target.value as ResultType)}
            >
              {RESULT_TYPES.map((r) => (
                <option key={r} value={r}>
                  {t[`result${r}` as const]}
                </option>
              ))}
            </Select>
          </Field>
        </>
      )}

      <ConfirmModal
        open={confirmUndo}
        onClose={() => setConfirmUndo(false)}
        onConfirm={() => {
          setError(null);
          setConfirmUndo(false);
          undo.mutate();
        }}
        title={t.undoResult}
        body={t.undoConfirm}
        confirmLabel={t.undoResult}
        cancelLabel={t.cancel}
        danger
      />
    </Modal>
  );
}
