import apiClient from "@/lib/api/client";
import type {
  AgeGroupAdmin,
  AgeGroupRequest,
  AgeGroupView,
  AgeGroupWithClasses,
  LadderRequest,
  RemovalResult,
  WeightClassRequest,
} from "@/types/classes";

// ── Reading (any signed-in user) ─────────────────────────────────────────────

/** The age groups in use, names and ages only. */
export async function fetchAgeGroups(): Promise<AgeGroupView[]> {
  const res = await apiClient.get<AgeGroupView[]>("/api/age-groups");
  return res.data;
}

/** The classes a tournament accepts, by age group (youngest first). */
export async function fetchTournamentClasses(
  tournamentId: number,
): Promise<AgeGroupWithClasses[]> {
  const res = await apiClient.get<AgeGroupWithClasses[]>(
    `/api/tournaments/${tournamentId}/classes`,
  );
  return res.data;
}

// ── Admin: the standard age groups and weight classes ────────────────────────
// Every change answers with the whole age group as it now is.

export async function listAgeGroupsAdmin(): Promise<AgeGroupAdmin[]> {
  const res = await apiClient.get<AgeGroupAdmin[]>("/api/admin/age-groups");
  return res.data;
}

export async function createAgeGroup(body: AgeGroupRequest): Promise<AgeGroupAdmin> {
  const res = await apiClient.post<AgeGroupAdmin>("/api/admin/age-groups", body);
  return res.data;
}

export async function updateAgeGroup(
  id: number,
  body: AgeGroupRequest,
): Promise<AgeGroupAdmin> {
  const res = await apiClient.put<AgeGroupAdmin>(`/api/admin/age-groups/${id}`, body);
  return res.data;
}

/** Deleted if nothing used it, archived if earlier tournaments still refer to it. */
export async function removeAgeGroup(id: number): Promise<RemovalResult> {
  const res = await apiClient.delete<RemovalResult>(`/api/admin/age-groups/${id}`);
  return res.data;
}

export async function restoreAgeGroup(id: number): Promise<AgeGroupAdmin> {
  const res = await apiClient.put<AgeGroupAdmin>(`/api/admin/age-groups/${id}/restore`);
  return res.data;
}

export async function addWeightClass(
  ageGroupId: number,
  body: WeightClassRequest,
): Promise<AgeGroupAdmin> {
  const res = await apiClient.post<AgeGroupAdmin>(
    `/api/admin/age-groups/${ageGroupId}/weight-classes`,
    body,
  );
  return res.data;
}

/** Several classes for one gender at once, e.g. limits 28, 35, 41. */
export async function addLadder(
  ageGroupId: number,
  body: LadderRequest,
): Promise<AgeGroupAdmin> {
  const res = await apiClient.post<AgeGroupAdmin>(
    `/api/admin/age-groups/${ageGroupId}/weight-classes/ladder`,
    body,
  );
  return res.data;
}

export async function updateWeightClass(
  id: number,
  body: WeightClassRequest,
): Promise<AgeGroupAdmin> {
  const res = await apiClient.put<AgeGroupAdmin>(`/api/admin/weight-classes/${id}`, body);
  return res.data;
}

/** Deleted if nothing used it, archived if earlier tournaments still refer to it. */
export async function removeWeightClass(id: number): Promise<AgeGroupAdmin> {
  const res = await apiClient.delete<AgeGroupAdmin>(`/api/admin/weight-classes/${id}`);
  return res.data;
}

export async function restoreWeightClass(id: number): Promise<AgeGroupAdmin> {
  const res = await apiClient.put<AgeGroupAdmin>(`/api/admin/weight-classes/${id}/restore`);
  return res.data;
}
