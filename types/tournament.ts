// Tournament registration types mirroring backend DTOs
// (TournamentParticipantDTO, WeightCategoryDTO, TournamentRegistrationRequestDTO).

export type ParticipantStatus =
  | "REGISTERED"
  | "CONFIRMED"
  | "WITHDRAWN"
  | "DISQUALIFIED"
  | "NO_SHOW";

export type CategoryGender = "MALE" | "FEMALE" | "MIXED";

/** One roster entry. The API deliberately omits CPR, contact and birth-date data. */
export interface TournamentParticipantDTO {
  participantId: number;
  tournamentId: number;
  tournamentName: string;
  playerId: number;
  playerFirstName: string;
  playerLastName: string;
  playerGender: "MALE" | "FEMALE";
  academyId: number;
  academyName: string;
  beltName: string | null;
  beltColor: string | null;
  categoryId: number;
  categoryName: string;
  categoryGender: CategoryGender;
  registrationDate: string | null;
  weighInWeight: number | null;
  seedNumber: number | null;
  status: ParticipantStatus;
}

export interface WeightCategoryDTO {
  categoryId: number;
  categoryName: string;
  gender: CategoryGender;
  minWeight: number | null;
  maxWeight: number | null;
  ageGroup: string | null;
}

export interface TournamentRegistrationRequest {
  playerId: number;
  categoryId: number;
}
