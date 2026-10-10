import apiClient from "@/lib/api/client";
import type {
  OfficialSummary,
  OfficialTournament,
  TournamentOfficials,
} from "@/types/official";

export async function fetchTournamentOfficials(
  tournamentId: number,
): Promise<TournamentOfficials> {
  const res = await apiClient.get<TournamentOfficials>(
    `/api/admin/tournaments/${tournamentId}/officials`,
  );
  return res.data;
}

/** Adds officials; the ones already on the list are skipped. Returns the updated list. */
export async function addTournamentOfficials(
  tournamentId: number,
  officialIds: number[],
): Promise<TournamentOfficials> {
  const res = await apiClient.post<TournamentOfficials>(
    `/api/admin/tournaments/${tournamentId}/officials`,
    { officialIds },
  );
  return res.data;
}

export async function removeTournamentOfficial(
  tournamentId: number,
  officialId: number,
): Promise<TournamentOfficials> {
  const res = await apiClient.delete<TournamentOfficials>(
    `/api/admin/tournaments/${tournamentId}/officials/${officialId}`,
  );
  return res.data;
}

export async function fetchOfficials(params?: {
  q?: string;
  activeOnly?: boolean;
}): Promise<OfficialSummary[]> {
  const res = await apiClient.get<OfficialSummary[]>("/api/admin/officials", { params });
  return res.data;
}

export async function fetchOfficialTournaments(
  officialId: number,
): Promise<OfficialTournament[]> {
  const res = await apiClient.get<OfficialTournament[]>(
    `/api/admin/officials/${officialId}/tournaments`,
  );
  return res.data;
}
