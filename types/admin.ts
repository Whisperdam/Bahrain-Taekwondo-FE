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
