import apiClient from "@/lib/api/client";
import type { PageResponse, TournamentDTO, AcademyDTO } from "@/types/dashboard";
import type {
  AdminUser,
  UpdateUserRolesRequest,
  RejectRequest,
  AppRole,
  UserStatus,
  TournamentRequest,
  TournamentStatus,
  AcademyRequest,
  AcademyStatus,
} from "@/types/admin";
import type {
  ApplicationStatus,
  ApplicationType,
  CoachApplicationSummary,
  OfficialApplicationSummary,
  AcademyApplicationSummary,
  CoachApplicationDetail,
  OfficialApplicationDetail,
  AcademyApplicationDetail,
} from "@/types/applications";

// ── Application queues ──────────────────────────────────────────────────────
export interface QueueParams {
  status?: ApplicationStatus;
  page?: number;
  size?: number;
}

function queueQs({ status, page, size }: QueueParams) {
  const p = new URLSearchParams();
  if (status) p.set("status", status);
  if (page != null) p.set("page", String(page));
  if (size != null) p.set("size", String(size));
  return p.toString() ? `?${p}` : "";
}

export async function listCoachQueue(
  params: QueueParams = {},
): Promise<PageResponse<CoachApplicationSummary>> {
  const res = await apiClient.get<PageResponse<CoachApplicationSummary>>(
    `/api/admin/applications/coaches${queueQs(params)}`,
  );
  return res.data;
}

export async function listOfficialQueue(
  params: QueueParams = {},
): Promise<PageResponse<OfficialApplicationSummary>> {
  const res = await apiClient.get<PageResponse<OfficialApplicationSummary>>(
    `/api/admin/applications/officials${queueQs(params)}`,
  );
  return res.data;
}

export async function listAcademyQueue(
  params: QueueParams = {},
): Promise<PageResponse<AcademyApplicationSummary>> {
  const res = await apiClient.get<PageResponse<AcademyApplicationSummary>>(
    `/api/admin/applications/academies${queueQs(params)}`,
  );
  return res.data;
}

// ── Application detail ──────────────────────────────────────────────────────
export async function getCoachApplicationDetail(
  id: number,
): Promise<CoachApplicationDetail> {
  const res = await apiClient.get<CoachApplicationDetail>(
    `/api/admin/applications/coaches/${id}`,
  );
  return res.data;
}

export async function getOfficialApplicationDetail(
  id: number,
): Promise<OfficialApplicationDetail> {
  const res = await apiClient.get<OfficialApplicationDetail>(
    `/api/admin/applications/officials/${id}`,
  );
  return res.data;
}

export async function getAcademyApplicationDetail(
  id: number,
): Promise<AcademyApplicationDetail> {
  const res = await apiClient.get<AcademyApplicationDetail>(
    `/api/admin/applications/academies/${id}`,
  );
  return res.data;
}

// ── Approve / Reject ────────────────────────────────────────────────────────
type AdminDecisionResult<T extends ApplicationType> = T extends "COACH"
  ? CoachApplicationDetail
  : T extends "OFFICIAL"
    ? OfficialApplicationDetail
    : AcademyApplicationDetail;

function basePath(type: ApplicationType): string {
  if (type === "COACH") return "/api/admin/applications/coaches";
  if (type === "OFFICIAL") return "/api/admin/applications/officials";
  return "/api/admin/applications/academies";
}

export async function approveApplication<T extends ApplicationType>(
  type: T,
  id: number,
): Promise<AdminDecisionResult<T>> {
  const res = await apiClient.put<AdminDecisionResult<T>>(
    `${basePath(type)}/${id}/approve`,
  );
  return res.data;
}

export async function rejectApplication<T extends ApplicationType>(
  type: T,
  id: number,
  body: RejectRequest,
): Promise<AdminDecisionResult<T>> {
  const res = await apiClient.put<AdminDecisionResult<T>>(
    `${basePath(type)}/${id}/reject`,
    body,
  );
  return res.data;
}

// ── Users ───────────────────────────────────────────────────────────────────
export interface SearchUsersParams {
  q?: string;
  status?: UserStatus | "";
  role?: AppRole | "";
  page?: number;
  size?: number;
}

export async function searchUsers(
  params: SearchUsersParams = {},
): Promise<PageResponse<AdminUser>> {
  const p = new URLSearchParams();
  if (params.q) p.set("q", params.q);
  if (params.status) p.set("status", params.status);
  if (params.role) p.set("role", params.role);
  if (params.page != null) p.set("page", String(params.page));
  if (params.size != null) p.set("size", String(params.size));
  const qs = p.toString() ? `?${p}` : "";
  const res = await apiClient.get<PageResponse<AdminUser>>(
    `/api/admin/users${qs}`,
  );
  return res.data;
}

export async function suspendUser(id: number): Promise<AdminUser> {
  const res = await apiClient.put<AdminUser>(`/api/admin/users/${id}/suspend`);
  return res.data;
}

export async function unsuspendUser(id: number): Promise<AdminUser> {
  const res = await apiClient.put<AdminUser>(
    `/api/admin/users/${id}/unsuspend`,
  );
  return res.data;
}

export async function replaceUserRoles(
  id: number,
  body: UpdateUserRolesRequest,
): Promise<AdminUser> {
  const res = await apiClient.put<AdminUser>(
    `/api/admin/users/${id}/roles`,
    body,
  );
  return res.data;
}

// ── Tournaments (admin CRUD; reads use the public endpoint) ────────────────
export interface ListTournamentsParams {
  status?: TournamentStatus;
  page?: number;
  size?: number;
}

export async function listTournamentsAdmin(
  params: ListTournamentsParams = {},
): Promise<PageResponse<TournamentDTO>> {
  const p = new URLSearchParams();
  if (params.status) p.set("status", params.status);
  if (params.page != null) p.set("page", String(params.page));
  if (params.size != null) p.set("size", String(params.size));
  const qs = p.toString() ? `?${p}` : "";
  const res = await apiClient.get<PageResponse<TournamentDTO>>(
    `/api/tournaments${qs}`,
  );
  return res.data;
}

export async function createTournament(
  body: TournamentRequest,
): Promise<TournamentDTO> {
  const res = await apiClient.post<TournamentDTO>(
    "/api/admin/tournaments",
    body,
  );
  return res.data;
}

export async function updateTournament(
  id: number,
  body: TournamentRequest,
): Promise<TournamentDTO> {
  const res = await apiClient.put<TournamentDTO>(
    `/api/admin/tournaments/${id}`,
    body,
  );
  return res.data;
}

export async function deleteTournament(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/tournaments/${id}`);
}

// ── Academies (admin CRUD; list includes INACTIVE) ─────────────────────────
export interface ListAcademiesParams {
  status?: AcademyStatus;
  page?: number;
  size?: number;
}

export async function listAcademiesAdmin(
  params: ListAcademiesParams = {},
): Promise<PageResponse<AcademyDTO>> {
  const p = new URLSearchParams();
  if (params.status) p.set("status", params.status);
  if (params.page != null) p.set("page", String(params.page));
  if (params.size != null) p.set("size", String(params.size));
  const qs = p.toString() ? `?${p}` : "";
  const res = await apiClient.get<PageResponse<AcademyDTO>>(
    `/api/admin/academies${qs}`,
  );
  return res.data;
}

export async function createAcademy(body: AcademyRequest): Promise<AcademyDTO> {
  const res = await apiClient.post<AcademyDTO>("/api/admin/academies", body);
  return res.data;
}

export async function updateAcademy(
  id: number,
  body: AcademyRequest,
): Promise<AcademyDTO> {
  const res = await apiClient.put<AcademyDTO>(
    `/api/admin/academies/${id}`,
    body,
  );
  return res.data;
}

export async function deactivateAcademy(id: number): Promise<AcademyDTO> {
  const res = await apiClient.delete<AcademyDTO>(`/api/admin/academies/${id}`);
  return res.data;
}

export async function activateAcademy(id: number): Promise<AcademyDTO> {
  const res = await apiClient.put<AcademyDTO>(
    `/api/admin/academies/${id}/activate`,
  );
  return res.data;
}
