export type OfficialSpecialization = "REFEREE" | "JUDGE" | "COACH_REFEREE" | "OFFICIAL";
export type OfficialLevel = "NATIONAL" | "REGIONAL" | "INTERNATIONAL";

/** An approved official, as listed for admins. */
export interface OfficialSummary {
  officialId: number;
  /** Their account, for linking to their page; null if they have none. */
  userId: number | null;
  name: string;
  specialization: OfficialSpecialization | null;
  certificationLevel: OfficialLevel | null;
  /** ISO date or null. */
  certificationExpiry: string | null;
  active: boolean;
  /** Tournaments they took part in (cancelled ones do not count). */
  tournamentCount: number;
}

export interface TournamentOfficial {
  officialId: number;
  /** Their account, for linking to their page; null if they have none. */
  userId: number | null;
  name: string;
  specialization: OfficialSpecialization | null;
  certificationLevel: OfficialLevel | null;
  certificationExpiry: string | null;
  active: boolean;
  addedAt: string;
}

/** The officials taking part in one tournament. */
export interface TournamentOfficials {
  tournamentId: number;
  tournamentName: string;
  status: string;
  startDate: string;
  /** The list can be changed until the tournament is over. */
  editable: boolean;
  officials: TournamentOfficial[];
}

/** One tournament an official took part in. */
export interface OfficialTournament {
  tournamentId: number;
  tournamentName: string;
  venue: string | null;
  startDate: string;
  endDate: string;
  status: string;
}
