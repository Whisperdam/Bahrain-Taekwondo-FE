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
