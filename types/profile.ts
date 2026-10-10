// The "my profile" page: the account, what can still be changed, and a player's own details.
// Mirrors the backend's MyProfileDTO and friends.

/** A player's own profile. The national ID is already masked by the server. */
export interface MyPlayer {
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

export interface Allowance {
  used: number;
  max: number;
  remaining: number;
}

export interface DetailsAllowance extends Allowance {
  windowDays: number;
  /** When the next edit becomes possible; null if one is possible now. */
  nextAvailableAt: string | null;
}

export interface ProfileAllowances {
  name: Allowance;
  username: Allowance;
  email: Allowance;
  details: DetailsAllowance;
}

export interface MyProfile {
  username: string;
  email: string;
  /** A new address waiting for its confirmation link to be opened. */
  pendingEmail: string | null;
  firstName: string;
  lastName: string;
  allowances: ProfileAllowances;
  /** Null when the person is not a player. */
  player: MyPlayer | null;
}

/** The details a player may change; a field left out stays as it is. */
export interface PlayerDetailsUpdate {
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  weight?: number;
  height?: number;
  bloodType?: string;
}
