// Tournament registration types mirroring backend DTOs
// (TournamentParticipantDTO, TournamentRegistrationRequestDTO).

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
  status: ParticipantStatus;
}

export interface TournamentRegistrationRequest {
  playerId: number;
  categoryId: number;
}
