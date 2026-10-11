import type { AcademyDTO } from "@/types/dashboard";

// Coach-portal-specific types mirroring backend DTOs.

/** A player as the coach of their academy sees them. The national ID is already masked by the server. */
/** (see the end of this file for the academy types) */
export interface CoachPlayer {
  playerId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  nationality: string | null;
  cprMasked: string | null;
  phone: string | null;
  email: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  academyId: number;
  academyName: string;
  beltName: string;
  beltColor: string;
  weight: number | null;
  height: number | null;
  bloodType: string | null;
  registrationDate: string | null;
  status: "ACTIVE" | "PENDING" | "INACTIVE" | "SUSPENDED" | "REJECTED";
  rejectionReason: string | null;
  rankingPoints: number | null;
}

export interface PlayerCreateRequest {
  userId: number;
  academyId: number;
  beltId: number;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "MALE" | "FEMALE";
  nationality?: string;
  cprNumber?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  weight?: number;
  height?: number;
  bloodType?: string;
  registrationDate?: string;
}

export interface PublicUserSummary {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  hasPlayerProfile: boolean;
  /** NOT_A_COACH, FREE (can be invited) or TIED (owns or belongs to an academy). */
  coachState: "NOT_A_COACH" | "FREE" | "TIED";
  /** NOT_A_PLAYER, RELEASED (free to be claimed) or IN_ACADEMY. */
  playerState: "NOT_A_PLAYER" | "RELEASED" | "IN_ACADEMY";
  hasProfilePhoto: boolean;
  profilePhotoUrl: string | null;
}

/**
 * Static belt table seeded in BE (`V1__init_schema.sql`). BE doesn't expose a
 * GET /api/belts endpoint yet, so we mirror the seed here. `isBlack` triggers
 * the "submit black-belt certificate" extra step + PENDING status server-side.
 */
export interface BeltOption {
  beltId: number;
  label: { en: string; ar: string };
  isBlack: boolean;
}

export const BELTS: BeltOption[] = [
  { beltId: 1, label: { en: "Colored Belt", ar: "حزام ملوّن" }, isBlack: false },
  { beltId: 2, label: { en: "1st Dan Black Belt", ar: "حزام أسود ١ دان" }, isBlack: true },
  { beltId: 3, label: { en: "2nd Dan Black Belt", ar: "حزام أسود ٢ دان" }, isBlack: true },
  { beltId: 4, label: { en: "3rd Dan Black Belt", ar: "حزام أسود ٣ دان" }, isBlack: true },
  { beltId: 5, label: { en: "4th Dan Black Belt", ar: "حزام أسود ٤ دان" }, isBlack: true },
  { beltId: 6, label: { en: "5th Dan Black Belt", ar: "حزام أسود ٥ دان" }, isBlack: true },
  { beltId: 7, label: { en: "6th Dan Black Belt", ar: "حزام أسود ٦ دان" }, isBlack: true },
  { beltId: 8, label: { en: "7th Dan Black Belt", ar: "حزام أسود ٧ دان" }, isBlack: true },
  { beltId: 9, label: { en: "8th Dan Black Belt", ar: "حزام أسود ٨ دان" }, isBlack: true },
  { beltId: 10, label: { en: "9th Dan Black Belt", ar: "حزام أسود ٩ دان" }, isBlack: true },
];

// ── Academies, coaches and releasing players ────────────────────────────────

/** What a coach who belongs to an academy (but does not own it) may do there. */
export type AcademyAccess = "NONE" | "VIEW" | "EDIT";

/** An academy as the coach sees it in their own panel. Owners always have EDIT. */
export interface CoachAcademy extends AcademyDTO {
  role: "OWNER" | "COACH";
  access: AcademyAccess;
  /** Owners only: the default name for a new branch, e.g. "Champions Academy 2". */
  suggestedBranchName: string | null;
  /** Active players the coach may see in it (0 without view access). */
  playerCount: number;
  /** The owner plus the coaches who belong to it. */
  coachCount: number;
}

export interface CoachMember {
  coachId: number;
  userId: number | null;
  name: string;
  beltName: string | null;
  role: "OWNER" | "COACH";
  access: AcademyAccess;
}

export interface AcademyInvite {
  inviteId: number;
  academyId: number;
  academyName: string;
  coachId: number;
  coachUserId: number | null;
  coachName: string;
  invitedByName: string | null;
  access: AcademyAccess;
  status: string;
  createdAt: string;
  expiresAt: string;
}
