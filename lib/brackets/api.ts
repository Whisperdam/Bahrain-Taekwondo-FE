import apiClient from "@/lib/api/client";
import type { MyPlayer } from "@/types/profile";
import type {
  Bracket,
  BracketMatch,
  BracketSummary,
  BulkPlacementRequest,
  BulkPlacementResult,
  GenerateResult,
  MatchListItem,
  MatchResultRequest,
  PlacementRequest,
  PublishAllResult,
  WeighInBoard,
  WeighInEntry,
} from "@/types/bracket";

// The brackets endpoints answer with an ETag that changes on every edit. The
// browser's HTTP cache revalidates with it automatically, so polling while
// nothing changes costs a tiny 304 instead of the whole bracket.

export async function fetchBrackets(tournamentId: number): Promise<BracketSummary[]> {
  const res = await apiClient.get<BracketSummary[]>(
    `/api/tournaments/${tournamentId}/brackets`,
  );
  return res.data;
}

export async function fetchBracket(
  tournamentId: number,
  bracketId: number,
): Promise<Bracket> {
  const res = await apiClient.get<Bracket>(
    `/api/tournaments/${tournamentId}/brackets/${bracketId}`,
  );
  return res.data;
}

/** Every real match of the published brackets as one flat list, optionally for one weight class. */
export async function fetchMatches(
  tournamentId: number,
  categoryId?: number,
): Promise<MatchListItem[]> {
  const res = await apiClient.get<MatchListItem[]>(
    `/api/tournaments/${tournamentId}/matches`,
    { params: categoryId ? { categoryId } : undefined },
  );
  return res.data;
}

/** The signed-in user's own player profile (404 when they are not a player). */
export async function fetchMyPlayer(): Promise<MyPlayer> {
  const res = await apiClient.get<MyPlayer>("/api/players/me");
  return res.data;
}

// ── Admin: weigh-in ────────────────────────────────────────────────────────

export async function fetchWeighInBoard(tournamentId: number): Promise<WeighInBoard> {
  const res = await apiClient.get<WeighInBoard>(
    `/api/admin/tournaments/${tournamentId}/weigh-in`,
  );
  return res.data;
}

export async function placeEntry(
  tournamentId: number,
  participantId: number,
  body: PlacementRequest,
): Promise<WeighInEntry> {
  const res = await apiClient.put<WeighInEntry>(
    `/api/admin/tournaments/${tournamentId}/participants/${participantId}/placement`,
    body,
  );
  return res.data;
}

export async function placeBulk(
  tournamentId: number,
  body: BulkPlacementRequest,
): Promise<BulkPlacementResult> {
  const res = await apiClient.put<BulkPlacementResult>(
    `/api/admin/tournaments/${tournamentId}/placements`,
    body,
  );
  return res.data;
}

// ── Admin: drawing and publishing ──────────────────────────────────────────

export async function generateBrackets(
  tournamentId: number,
  body: { categoryId?: number; seeding?: "RANKING" | "RANDOM" } = {},
): Promise<GenerateResult> {
  const res = await apiClient.post<GenerateResult>(
    `/api/admin/tournaments/${tournamentId}/brackets/generate`,
    body,
  );
  return res.data;
}

export async function publishAllBrackets(tournamentId: number): Promise<PublishAllResult> {
  const res = await apiClient.post<PublishAllResult>(
    `/api/admin/tournaments/${tournamentId}/brackets/publish`,
  );
  return res.data;
}

export async function publishBracket(bracketId: number): Promise<void> {
  await apiClient.post(`/api/admin/brackets/${bracketId}/publish`);
}

export async function unpublishBracket(bracketId: number): Promise<void> {
  await apiClient.post(`/api/admin/brackets/${bracketId}/unpublish`);
}

export async function swapSlots(
  bracketId: number,
  slotA: number,
  slotB: number,
): Promise<void> {
  await apiClient.put(`/api/admin/brackets/${bracketId}/swap`, { slotA, slotB });
}

export async function setBracketCourt(bracketId: number, court: string): Promise<void> {
  await apiClient.put(`/api/admin/brackets/${bracketId}/court`, { court });
}

export async function deleteBracket(bracketId: number): Promise<void> {
  await apiClient.delete(`/api/admin/brackets/${bracketId}`);
}

// ── Results ────────────────────────────────────────────────────────────────

export async function startMatch(matchId: number): Promise<BracketMatch> {
  const res = await apiClient.post<BracketMatch>(`/api/matches/${matchId}/start`);
  return res.data;
}

export async function swapMatchCorners(matchId: number): Promise<BracketMatch> {
  const res = await apiClient.post<BracketMatch>(`/api/matches/${matchId}/swap-corners`);
  return res.data;
}

export async function setMatchResult(
  matchId: number,
  body: MatchResultRequest,
): Promise<BracketMatch> {
  const res = await apiClient.post<BracketMatch>(`/api/matches/${matchId}/result`, body);
  return res.data;
}

export async function correctMatchResult(
  matchId: number,
  body: MatchResultRequest,
): Promise<BracketMatch> {
  const res = await apiClient.put<BracketMatch>(`/api/matches/${matchId}/result`, body);
  return res.data;
}

export async function undoMatchResult(
  matchId: number,
  expectedWinnerId: number,
): Promise<BracketMatch> {
  const res = await apiClient.delete<BracketMatch>(`/api/matches/${matchId}/result`, {
    params: { expectedWinnerId },
  });
  return res.data;
}
