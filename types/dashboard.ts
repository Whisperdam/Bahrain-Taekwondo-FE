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
}

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
  tournamentsParticipated: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
}

export interface AcademyDTO {
  academyId: number;
  academyName: string;
  location: string;
  phone?: string;
  email?: string;
  establishedDate?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
