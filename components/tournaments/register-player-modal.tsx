"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { ErrorBanner } from "@/components/ui/error-banner";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { getPlayersByAcademy } from "@/lib/coach/api";
import { fetchWeightCategories, registerPlayer } from "@/lib/tournaments/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { TournamentStrings } from "@/lib/i18n/tournament-strings";
import type { AcademyDTO } from "@/types/dashboard";
import type { WeightCategoryDTO } from "@/types/tournament";

interface RegisterPlayerModalProps {
  tournamentId: number;
  academies: AcademyDTO[];
  /** Players who already hold a slot — they can't be entered twice. */
  registeredPlayerIds: Set<number>;
  t: TournamentStrings;
  onClose: () => void;
  onRegistered: () => void;
}

/** First non-mixed class whose weight window (min, max] contains the weight. */
function suggestCategory(
  categories: WeightCategoryDTO[],
  weight: number | null,
): WeightCategoryDTO | undefined {
  if (weight == null) return undefined;
  return categories.find(
    (c) =>
      c.gender !== "MIXED" &&
      (c.minWeight == null || weight > c.minWeight) &&
      (c.maxWeight == null || weight <= c.maxWeight),
  );
}

/**
 * Mount this only while it is open (`{open && <RegisterPlayerModal …/>}`) so
 * the form starts fresh each time.
 */
export function RegisterPlayerModal({
  tournamentId,
  academies,
  registeredPlayerIds,
  t,
  onClose,
  onRegistered,
}: RegisterPlayerModalProps) {
  // `null` = "user hasn't chosen yet" → fall back to the default below.
  const [academyChoice, setAcademyChoice] = useState<string | null>(null);
  const [playerChoice, setPlayerChoice] = useState("");
  const [categoryChoice, setCategoryChoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const academyId = academyChoice ?? String(academies[0]?.academyId ?? "");

  const playersQ = useQuery({
    queryKey: ["coach", "players", Number(academyId)],
    queryFn: () => getPlayersByAcademy(Number(academyId)),
    enabled: academyId !== "",
  });

  const eligible = (playersQ.data ?? []).filter(
    (p) => p.status === "ACTIVE" && !registeredPlayerIds.has(p.playerId),
  );
  const player = eligible.find((p) => String(p.playerId) === playerChoice);

  const categoriesQ = useQuery({
    queryKey: ["weight-categories", player?.gender],
    queryFn: () => fetchWeightCategories(player!.gender),
    enabled: !!player,
  });
  const categories = categoriesQ.data ?? [];

  const suggested = player
    ? suggestCategory(categories, player.weight)
    : undefined;
  const categoryId = categoryChoice ?? (suggested ? String(suggested.categoryId) : "");
  const usingSuggestion = categoryChoice === null && !!suggested;

  const mutation = useMutation({
    mutationFn: () =>
      registerPlayer(tournamentId, {
        playerId: Number(playerChoice),
        categoryId: Number(categoryId),
      }),
    onSuccess: () => {
      toast.success(t.registerSuccess(`${player?.firstName} ${player?.lastName}`));
      onRegistered();
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, t.registerFailed)),
  });

  const canSubmit = !!player && categoryId !== "" && !mutation.isPending;

  return (
    <Modal
      open
      onClose={() => !mutation.isPending && onClose()}
      title={t.registerTitle}
      dismissible={!mutation.isPending}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={mutation.isPending}>
            {t.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={() => {
              setError(null);
              mutation.mutate();
            }}
            disabled={!canSubmit}
            loading={mutation.isPending}
            loadingText={t.registering}
            className="w-auto px-4"
          >
            {t.register}
          </PrimaryButton>
        </>
      }
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {academies.length > 1 && (
        <Field id="reg-academy" label={t.academy}>
          <Select
            id="reg-academy"
            value={academyId}
            onChange={(e) => {
              setAcademyChoice(e.target.value);
              setPlayerChoice("");
              setCategoryChoice(null);
            }}
          >
            {academies.map((a) => (
              <option key={a.academyId} value={a.academyId}>
                {a.academyName}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field id="reg-player" label={t.player}>
        <Select
          id="reg-player"
          value={playerChoice}
          disabled={playersQ.isLoading || eligible.length === 0}
          onChange={(e) => {
            setPlayerChoice(e.target.value);
            setCategoryChoice(null);
          }}
        >
          <option value="">
            {playersQ.isLoading ? t.loadingPlayers : t.selectPlayer}
          </option>
          {eligible.map((p) => (
            <option key={p.playerId} value={p.playerId}>
              {p.firstName} {p.lastName} · {p.beltName}
            </option>
          ))}
        </Select>
        {!playersQ.isLoading && eligible.length === 0 && (
          <p className="mt-1.5 text-[11px] text-slate-500">{t.noEligiblePlayers}</p>
        )}
      </Field>

      <Field
        id="reg-class"
        label={t.weightClass}
        hint={usingSuggestion ? t.suggestedClass : undefined}
      >
        <Select
          id="reg-class"
          value={categoryId}
          disabled={!player || categoriesQ.isLoading}
          onChange={(e) => setCategoryChoice(e.target.value)}
        >
          <option value="">{t.selectClass}</option>
          {categories.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>
              {c.categoryName}
            </option>
          ))}
        </Select>
        {player && !categoriesQ.isLoading && categories.length === 0 && (
          <p className="mt-1.5 text-[11px] text-slate-500">{t.noClasses}</p>
        )}
      </Field>
    </Modal>
  );
}
