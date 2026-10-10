// Age groups and weight classes, mirroring the backend DTOs
// (AgeGroupViewDTO, AgeGroupWithClassesDTO, ClassViewDTO and the admin views in dto.admin).

export type ClassGender = "MALE" | "FEMALE" | "MIXED";

/** Name and ages only. Ages are counted by year of birth. */
export interface AgeGroupView {
  ageGroupId: number;
  name: string;
  minAge: number;
  maxAge: number;
}

export interface ClassView {
  categoryId: number;
  /** Already says the age group, gender and limit, e.g. "Kids Male -35kg". */
  name: string;
  gender: ClassGender;
  minWeight: number | null;
  /** null = the open-ended top class. */
  maxWeight: number | null;
}

/** What a tournament accepts: an age group with the classes of it that were chosen. */
export interface AgeGroupWithClasses extends AgeGroupView {
  classes: ClassView[];
}

// ── Admin ────────────────────────────────────────────────────────────────────

export interface WeightClassAdmin extends ClassView {
  archived: boolean;
  /** Tournaments (not deleted or cancelled) that accept this class. */
  tournamentCount: number;
  /** A tournament that has started or finished used it: its limit can no longer change. */
  locked: boolean;
}

export interface AgeGroupAdmin extends AgeGroupView {
  archived: boolean;
  tournamentCount: number;
  /** A tournament that has started or finished used it: its ages can no longer change. */
  locked: boolean;
  classes: WeightClassAdmin[];
}

export interface AgeGroupRequest {
  name: string;
  minAge: number;
  maxAge: number;
}

export interface WeightClassRequest {
  gender?: ClassGender;
  /** null = open-ended. */
  maxWeight: number | null;
}

export interface LadderRequest {
  gender: ClassGender;
  limits: number[];
  openEnded: boolean;
}

/** `archived: true` when earlier tournaments still refer to it, so it was kept instead of deleted. */
export interface RemovalResult {
  archived: boolean;
}
