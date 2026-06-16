export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  roles: string[];
  /** True when the user has a profile photo document attached. */
  hasProfilePhoto?: boolean;
  /** Presigned R2 URL for the user's profile photo, or null if none. */
  profilePhotoUrl?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: UserProfile;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
