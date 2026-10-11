import apiClient from "@/lib/api/client";
import type { AcademyDTO } from "@/types/dashboard";
import type {
  CoachPlayer,
  PlayerCreateRequest,
  PublicUserSummary,
} from "@/types/coach";

/** Academies owned by the authenticated coach. */
export async function getMyAcademies(): Promise<AcademyDTO[]> {
  const res = await apiClient.get<AcademyDTO[]>("/api/coach/me/academies");
  return res.data;
}

/** The players of one of the coach's own academies (anyone else's academy is refused). */
export async function getPlayersByAcademy(academyId: number): Promise<CoachPlayer[]> {
  const res = await apiClient.get<CoachPlayer[]>(
    `/api/coach/me/academies/${academyId}/players`,
  );
  return res.data;
}

/** One player of an academy the coach owns, with the details only the coach and admins see. */
export async function getCoachPlayer(playerId: number): Promise<CoachPlayer> {
  const res = await apiClient.get<CoachPlayer>(`/api/coach/me/players/${playerId}`);
  return res.data;
}

/** Look up an existing user by email. Returns 404 if not found. */
export async function searchUserByEmail(
  email: string,
): Promise<PublicUserSummary> {
  const res = await apiClient.get<PublicUserSummary>("/api/users/search", {
    params: { email },
  });
  return res.data;
}

/** Coach enrolls an existing user as a player in one of their academies. */
export async function createPlayer(body: PlayerCreateRequest): Promise<CoachPlayer> {
  const res = await apiClient.post<CoachPlayer>("/api/players", body);
  return res.data;
}
