import apiClient from "@/lib/api/client";
import type { AcademyDTO } from "@/types/dashboard";
import type {
  Player,
  PlayerCreateRequest,
  PublicUserSummary,
} from "@/types/coach";

/** Academies owned by the authenticated coach. */
export async function getMyAcademies(): Promise<AcademyDTO[]> {
  const res = await apiClient.get<AcademyDTO[]>("/api/coach/me/academies");
  return res.data;
}

/** All non-deleted players enrolled in a given academy. */
export async function getPlayersByAcademy(academyId: number): Promise<Player[]> {
  const res = await apiClient.get<Player[]>(
    `/api/players/academy/${academyId}`,
  );
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
export async function createPlayer(body: PlayerCreateRequest): Promise<Player> {
  const res = await apiClient.post<Player>("/api/players", body);
  return res.data;
}
