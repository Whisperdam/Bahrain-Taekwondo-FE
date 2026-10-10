import apiClient from "@/lib/api/client";
import type { TournamentDTO } from "@/types/dashboard";
import type {
  TournamentParticipantDTO,
  TournamentRegistrationRequest,
} from "@/types/tournament";

export async function fetchTournament(id: number): Promise<TournamentDTO> {
  const res = await apiClient.get<TournamentDTO>(`/api/tournaments/${id}`);
  return res.data;
}

/** Roster — withdrawn entries are already excluded server-side. */
export async function fetchParticipants(
  id: number,
): Promise<TournamentParticipantDTO[]> {
  const res = await apiClient.get<TournamentParticipantDTO[]>(
    `/api/tournaments/${id}/participants`,
  );
  return res.data;
}

/** Coach (own academies) or admin enters a player in a weight class. */
export async function registerPlayer(
  tournamentId: number,
  body: TournamentRegistrationRequest,
): Promise<TournamentParticipantDTO> {
  const res = await apiClient.post<TournamentParticipantDTO>(
    `/api/tournaments/${tournamentId}/participants`,
    body,
  );
  return res.data;
}

export async function withdrawParticipant(
  tournamentId: number,
  participantId: number,
): Promise<void> {
  await apiClient.delete(
    `/api/tournaments/${tournamentId}/participants/${participantId}`,
  );
}

