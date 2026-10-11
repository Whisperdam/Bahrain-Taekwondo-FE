// The profile pages, mirroring PlayerProfileDTO, UserProfileDTO and the results-access answer.

/** What any signed-in user sees of a player. No birth date, ID, contact details, weight or height. */
export interface PlayerProfile {
  playerId: number;
  firstName: string;
  lastName: string;
  academyId: number | null;
  academyName: string | null;
  beltName: string | null;
  beltColor: string | null;
  rankingPoints: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  profilePhotoUrl: string | null;
  /** True for admins and the coach who owns the player's academy: they may open the private view too. */
  canViewPrivate: boolean;
}

export interface UserProfileAcademy {
  academyId: number;
  academyName: string;
}

/** What any signed-in user sees of a coach, official or player. No email, username, roles or status. */
export interface UserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  coach: boolean;
  coachBeltName: string | null;
  coachBeltColor: string | null;
  academies: UserProfileAcademy[];
  official: boolean;
  officialSpecialization: string | null;
  officialCertificationLevel: string | null;
  /** Set when the person is an approved player. */
  playerId: number | null;
  /** True for admins, who may also open the admin view of the account. */
  canViewPrivate: boolean;
}

export interface ResultsAccess {
  canEnterResults: boolean;
}
