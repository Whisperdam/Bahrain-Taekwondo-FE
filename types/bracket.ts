// Mirrors dto/bracket/* on the backend.

export type BracketStatus = "DRAFT" | "PUBLISHED";
export type MatchStatus = "PENDING" | "READY" | "IN_PROGRESS" | "COMPLETED";
export type ResultType =
  | "POINTS"
  | "GOLDEN_POINT"
  | "KNOCKOUT"
  | "DISQUALIFICATION"
  | "WALKOVER";

export interface BracketPlayer {
  playerId: number;
  name: string;
  academyId: number | null;
  academyName: string | null;
}

export type Corner = "BLUE" | "RED";

export interface BracketMatch {
  matchId: number;
  /** 1 = first round, up to the final. */
  roundNumber: number;
  /** Position within the round, top to bottom, from 0. */
  matchIndex: number;
  /** Null for byes. */
  matchNumber: string | null;
  status: MatchStatus;
  bye: boolean;
  player1: BracketPlayer | null;
  player2: BracketPlayer | null;
  /** What each player wears. Null until both players are known. */
  player1Corner: Corner | null;
  player2Corner: Corner | null;
  winnerId: number | null;
  player1Score: number | null;
  player2Score: number | null;
  resultType: ResultType | "BYE" | null;
  startedAt: string | null;
  decidedAt: string | null;
}

/** A match in the tournament-wide list: the match plus the bracket it belongs to. */
export interface MatchListItem extends BracketMatch {
  bracketId: number;
  categoryId: number;
  categoryName: string;
  categoryGender: "MALE" | "FEMALE" | "MIXED";
  court: string | null;
  totalRounds: number;
}

export interface BracketSummary {
  bracketId: number;
  tournamentId: number;
  categoryId: number;
  categoryName: string;
  categoryGender: "MALE" | "FEMALE" | "MIXED";
  status: BracketStatus;
  court: string | null;
  playerCount: number;
  totalRounds: number;
  matchesTotal: number;
  matchesCompleted: number;
  complete: boolean;
  /** Changes whenever anything in the bracket changes. */
  revision: number;
  publishedAt: string | null;
  /** Admins only: placements changed since this bracket was drawn. */
  stale: boolean | null;
  champion: BracketPlayer | null;
}

export interface PodiumEntry {
  medal: "GOLD" | "SILVER" | "BRONZE";
  player: BracketPlayer;
}

export interface Bracket {
  summary: BracketSummary;
  matches: BracketMatch[];
  podium: PodiumEntry[];
}

// ── Weigh-in ────────────────────────────────────────────────────────────────

export type EntryStatus = "REGISTERED" | "CONFIRMED" | "NO_SHOW";

export interface WeighInEntry {
  participantId: number;
  playerId: number;
  playerName: string;
  gender: "MALE" | "FEMALE";
  academyId: number | null;
  academyName: string | null;
  beltName: string | null;
  /** For checking against the player's ID at the weigh-in (YYYY-MM-DD). */
  dateOfBirth: string;
  /** The age that counts for this tournament: its year minus the birth year. */
  age: number;
  /** The tournament's age group that age falls in; null if none of its groups covers it. */
  ageGroupName: string | null;
  rankingPoints: number;
  declaredCategoryId: number;
  declaredCategoryName: string;
  declaredCategoryGender: "MALE" | "FEMALE" | "MIXED";
  placedCategoryId: number | null;
  placedCategoryName: string | null;
  status: EntryStatus;
  weighInWeight: number | null;
}

export interface WeighInBoard {
  tournamentId: number;
  tournamentName: string;
  tournamentStatus: string;
  registrationOpen: boolean;
  entries: WeighInEntry[];
}

export interface PlacementRequest {
  action: "PLACE" | "NO_SHOW" | "RESET";
  categoryId?: number;
  weighInWeight?: number;
}

export interface BulkPlacementRequest {
  action: "PLACE_DECLARED" | "NO_SHOW" | "RESET";
  participantIds?: number[];
}

export interface BulkPlacementResult {
  updated: number;
  skipped: number;
}

export interface GenerateOutcome {
  categoryId: number;
  categoryName: string;
  outcome:
    | "GENERATED"
    | "SKIPPED_PUBLISHED"
    | "NOT_ENOUGH_PLAYERS"
    | "REMOVED_DRAFT";
  bracketId: number | null;
  playerCount: number | null;
}

export interface GenerateResult {
  outcomes: GenerateOutcome[];
}

export interface PublishAllResult {
  published: number;
  skippedStale: number;
}

export interface MatchResultRequest {
  winnerId: number;
  player1Score?: number | null;
  player2Score?: number | null;
  resultType?: ResultType;
  /** Corrections only: the winner currently recorded. */
  expectedWinnerId?: number;
}
