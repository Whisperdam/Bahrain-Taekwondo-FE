import apiClient from "@/lib/api/client";
import type {
  TournamentDTO,
  NationalRankingDTO,
  AcademyDTO,
  PageResponse,
} from "@/types/dashboard";

export async function fetchUpcomingTournaments(): Promise<TournamentDTO[]> {
  const res = await apiClient.get<PageResponse<TournamentDTO>>(
    "/api/tournaments?status=UPCOMING&page=0&size=3&sort=startDate,asc",
  );
  return res.data.content;
}

export async function fetchTopRankings(season = 2026): Promise<NationalRankingDTO[]> {
  const res = await apiClient.get<PageResponse<NationalRankingDTO>>(
    `/api/rankings?page=0&size=5&sort=rankPosition,asc&season=${season}`,
  );
  return res.data.content;
}

export async function fetchAcademies(): Promise<AcademyDTO[]> {
  const res = await apiClient.get<PageResponse<AcademyDTO>>(
    "/api/academies?page=0&size=6&sort=academyName,asc",
  );
  return res.data.content;
}

// ── Paged wrappers for the "view all" browse pages ─────────────────────────
// Unlike the teaser fetchers above (which unwrap .content), these return the
// full PageResponse so the pages can paginate.

export interface ListTournamentsParams {
  status?: string;
  q?: string;
  from?: string; // YYYY-MM-DD
  to?: string;
  sort?: string; // e.g. "startDate,asc"
  page?: number;
  size?: number;
}

export async function listTournaments(
  params: ListTournamentsParams = {},
): Promise<PageResponse<TournamentDTO>> {
  const p = new URLSearchParams();
  if (params.status) p.set("status", params.status);
  if (params.q) p.set("q", params.q);
  if (params.from) p.set("from", params.from);
  if (params.to) p.set("to", params.to);
  if (params.sort) p.set("sort", params.sort);
  if (params.page != null) p.set("page", String(params.page));
  if (params.size != null) p.set("size", String(params.size));
  const res = await apiClient.get<PageResponse<TournamentDTO>>(
    `/api/tournaments?${p}`,
  );
  return res.data;
}

export interface ListAcademiesParams {
  q?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export async function listAcademies(
  params: ListAcademiesParams = {},
): Promise<PageResponse<AcademyDTO>> {
  const p = new URLSearchParams();
  if (params.q) p.set("q", params.q);
  if (params.sort) p.set("sort", params.sort);
  if (params.page != null) p.set("page", String(params.page));
  if (params.size != null) p.set("size", String(params.size));
  const res = await apiClient.get<PageResponse<AcademyDTO>>(
    `/api/academies?${p}`,
  );
  return res.data;
}

export interface ListRankingsParams {
  season?: string;
  q?: string;
  /** MALE or FEMALE — male/female divisions rank separately (each has its own #1). */
  gender?: "MALE" | "FEMALE";
  sort?: string;
  page?: number;
  size?: number;
}

export async function listRankings(
  params: ListRankingsParams = {},
): Promise<PageResponse<NationalRankingDTO>> {
  const p = new URLSearchParams();
  if (params.season) p.set("season", params.season);
  if (params.q) p.set("q", params.q);
  if (params.gender) p.set("gender", params.gender);
  if (params.sort) p.set("sort", params.sort);
  if (params.page != null) p.set("page", String(params.page));
  if (params.size != null) p.set("size", String(params.size));
  const res = await apiClient.get<PageResponse<NationalRankingDTO>>(
    `/api/rankings?${p}`,
  );
  return res.data;
}
