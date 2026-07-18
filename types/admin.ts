// Mirrors backend DTOs in dto/admin/*

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
