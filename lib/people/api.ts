import apiClient from "@/lib/api/client";
import type { PlayerProfile, ResultsAccess, UserProfile } from "@/types/people";

/** The public view of a player (any signed-in user). */
export async function fetchPlayerProfile(playerId: number): Promise<PlayerProfile> {
  const res = await apiClient.get<PlayerProfile>(`/api/players/${playerId}/profile`);
  return res.data;
}

/** The public view of a coach, official or player's account (any signed-in user). */
export async function fetchUserProfile(userId: number): Promise<UserProfile> {
  const res = await apiClient.get<UserProfile>(`/api/users/${userId}/profile`);
  return res.data;
}

/** Whether the signed-in user may enter the results of this tournament (admin, or an official chosen for it). */
export async function fetchResultsAccess(tournamentId: number): Promise<ResultsAccess> {
  const res = await apiClient.get<ResultsAccess>(`/api/tournaments/${tournamentId}/results-access`);
  return res.data;
}
