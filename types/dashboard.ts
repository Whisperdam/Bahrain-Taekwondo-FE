import type { AgeGroupView } from "@/types/classes";

export interface TournamentDTO {
  tournamentId: number;
  tournamentName: string;
  description?: string;
  tournamentType: "NATIONAL" | "INTERNATIONAL" | "REGIONAL";
  venue: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  maxParticipants?: number;
  status: string;
  bannerImageUrl?: string;
  // Registration summary — present only on GET /api/tournaments/{id}
  participantCount?: number;
  registrationOpen?: boolean;
  registrationClosedReason?: RegistrationClosedReason | null;
  /** Results can be corrected until this moment; ranking points are published then. */
  pointsPublishAt?: string | null;
  /** When the ranking points were published; null until then. */
  pointsFinalizedAt?: string | null;
  /** The age groups the tournament accepts (only on GET /api/tournaments/{id}). */
  eligibleAgeGroups?: AgeGroupView[] | null;
}

export type RegistrationClosedReason =
  | "NOT_UPCOMING"
  | "DEADLINE_PASSED"
  | "FULL";

export interface NationalRankingDTO {
  rankingId: number;
  rankPosition: number;
  totalPoints: number;
  season: string;
  playerId: number;
  playerFirstName: string;
  playerLastName: string;
  academyId: number;
  academyName: string;
  categoryId: number;
  categoryName: string;
  categoryGender: string;
  /** Positions are separate for each age group and gender. */
  ageGroupId: number | null;
  ageGroupName: string | null;
  tournamentsParticipated: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
}

export interface AcademyDTO {
  academyId: number;
  academyName: string;
  location: string;
  phone?: string | null;
  email?: string | null;
  establishedDate?: string | null;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  owningCoachId?: number | null;
  owningCoachName?: string | null;
  /** The academy this one is a branch of; null for a root academy. */
  parentAcademyId?: number | null;
  parentAcademyName?: string | null;
}

/** A branch listed on its root academy's page. */
export interface AcademyBranchDTO {
  academyId: number;
  academyName: string;
  location: string | null;
}

/** A coach listed on their academy's page. */
export interface AcademyStaffDTO {
  userId: number;
  name: string;
  role: "OWNER" | "COACH";
}

/** Public-safe roster row from GET /api/academies/{id}/players. */
export interface AcademyPlayerDTO {
  playerId: number;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  beltName: string | null;
  beltColor: string | null;
  rankingPoints: number | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
