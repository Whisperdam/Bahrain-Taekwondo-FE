import apiClient from "@/lib/api/client";
import type {
  AcademyAccess,
  AcademyInvite,
  CoachAcademy,
  CoachMember,
  CoachPlayer,
  PlayerCreateRequest,
  PublicUserSummary,
} from "@/types/coach";

/** Academies the coach owns, and the one they belong to, with what they may do in each. */
export async function getMyAcademies(): Promise<CoachAcademy[]> {
  const res = await apiClient.get<CoachAcademy[]>("/api/coach/me/academies");
  return res.data;
}

// ── Coaches of an academy ───────────────────────────────────────────────────

export async function getAcademyCoaches(academyId: number): Promise<CoachMember[]> {
  const res = await apiClient.get<CoachMember[]>(`/api/coach/me/academies/${academyId}/coaches`);
  return res.data;
}

/** Invitations the owner has sent that are still waiting. */
export async function getSentInvites(academyId: number): Promise<AcademyInvite[]> {
  const res = await apiClient.get<AcademyInvite[]>(`/api/coach/me/academies/${academyId}/coach-invites`);
  return res.data;
}

export async function inviteCoach(
  academyId: number,
  body: { userId: number; access: AcademyAccess },
): Promise<AcademyInvite> {
  const res = await apiClient.post<AcademyInvite>(`/api/coach/me/academies/${academyId}/coach-invites`, body);
  return res.data;
}

export async function cancelInvite(inviteId: number): Promise<void> {
  await apiClient.delete(`/api/coach/me/coach-invites/${inviteId}`);
}

export async function changeCoachAccess(
  academyId: number,
  coachId: number,
  access: AcademyAccess,
): Promise<CoachMember> {
  const res = await apiClient.put<CoachMember>(
    `/api/coach/me/academies/${academyId}/coaches/${coachId}`,
    { access },
  );
  return res.data;
}

/** The owner releases a coach, who stays a coach and becomes free. */
export async function releaseCoach(academyId: number, coachId: number): Promise<void> {
  await apiClient.delete(`/api/coach/me/academies/${academyId}/coaches/${coachId}`);
}

/** Invitations the signed-in coach has received. */
export async function getMyInvitations(): Promise<AcademyInvite[]> {
  const res = await apiClient.get<AcademyInvite[]>("/api/coach/me/invitations");
  return res.data;
}

export async function acceptInvitation(inviteId: number): Promise<CoachAcademy> {
  const res = await apiClient.post<CoachAcademy>(`/api/coach/me/invitations/${inviteId}/accept`);
  return res.data;
}

export async function declineInvitation(inviteId: number): Promise<void> {
  await apiClient.post(`/api/coach/me/invitations/${inviteId}/decline`);
}

export async function leaveAcademy(): Promise<void> {
  await apiClient.post("/api/coach/me/leave-academy");
}

// ── Releasing and claiming players ──────────────────────────────────────────

/** The owner lets a player go; they keep their record and can be claimed by another academy. */
export async function releasePlayer(playerId: number): Promise<void> {
  await apiClient.post(`/api/coach/me/players/${playerId}/release`);
}

/** Adds a released player to an academy the coach may edit. */
export async function claimPlayer(academyId: number, userId: number): Promise<CoachPlayer> {
  const res = await apiClient.post<CoachPlayer>(`/api/coach/me/academies/${academyId}/players/claim`, { userId });
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
