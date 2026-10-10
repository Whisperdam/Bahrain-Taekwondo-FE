// Mirrors backend DTOs in dto/admin/*

import type { ApplicationStatus, DocumentSummary, Gender } from "./applications";

export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export type AppRole =
  | "ROLE_VIEWER"
  | "ROLE_COACH"
  | "ROLE_OFFICIAL"
  | "ROLE_PLAYER"
  | "ROLE_ADMIN";

export interface AdminUser {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: UserStatus;
  enabled: boolean;
  roles: AppRole[];
  createdAt: string;
  lastLogin: string | null;
  hasProfilePhoto: boolean;
  profilePhotoUrl: string | null;
}

export interface UpdateUserRolesRequest {
  roles: AppRole[];
}

export interface RejectRequest {
  reason: string;
}

// ── Tournament / Academy admin CRUD ─────────────────────────────────────────

export type TournamentType = "NATIONAL" | "INTERNATIONAL" | "REGIONAL";
export type TournamentStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface TournamentRequest {
  tournamentName: string;
  description?: string;
  tournamentType?: TournamentType;
  venue?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  registrationDeadline?: string;
  maxParticipants?: number;
  status?: TournamentStatus;
  bannerImageUrl?: string;
  /** The weight classes the tournament accepts. Required when creating; leave out on edit to keep them. */
  categoryIds?: number[];
}

export type AcademyStatus = "ACTIVE" | "INACTIVE";

export interface AcademyRequest {
  academyName: string;
  location?: string;
  phone?: string;
  email?: string;
  establishedDate?: string;
  description?: string;
  owningCoachId?: number;
  status?: AcademyStatus;
}

// ── Review queue ────────────────────────────────────────────────────────────
// GET /api/admin/review-queue — coach / official / academy applications and
// players awaiting black-belt verification in one list.

export type ReviewType = "COACH" | "OFFICIAL" | "ACADEMY" | "PLAYER";

export interface ReviewQueueItem {
  type: ReviewType;
  /** applicationId for the three application types, playerId for PLAYER. */
  id: number;
  /** Person's name, or the proposed academy name for ACADEMY. */
  subject: string;
  /**
   * Certification level (COACH), specialization (OFFICIAL), applying coach
   * (ACADEMY) or "academy · belt" (PLAYER). Raw, may be null.
   */
  detail: string | null;
  email: string | null;
  status: ApplicationStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
}

/** GET /api/admin/players/{id} — what an admin needs to verify a belt certificate. */
export interface PlayerReviewDetail {
  playerId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  nationality: string | null;
  cprNumber: string | null;
  phone: string | null;
  email: string | null;
  academyId: number | null;
  academyName: string | null;
  beltName: string | null;
  beltColor: string | null;
  registrationDate: string | null;
  playerStatus: string;
  /** PENDING, APPROVED, REJECTED — or the raw status for players who never needed review. */
  reviewStatus: string;
  addedBy: string | null;
  submittedAt: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  userId: number | null;
  username: string | null;
  userEmail: string | null;
  documents: DocumentSummary[];
}
