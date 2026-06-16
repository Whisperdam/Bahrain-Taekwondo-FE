// Coach-portal-specific types mirroring backend DTOs.

export interface Player {
  playerId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  nationality: string | null;
  cprNumber: string | null;
  phone: string | null;
  email: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  academyId: number;
  academyName: string;
  beltId: number;
  beltName: string;
  beltColor: string;
  weight: number | null;
  height: number | null;
  bloodType: string | null;
  registrationDate: string | null;
  status: "ACTIVE" | "PENDING" | "INACTIVE" | "SUSPENDED";
  rankingPoints: number | null;
  createdBy?: string;
}

export interface PlayerCreateRequest {
  userId: number;
  academyId: number;
  beltId: number;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "MALE" | "FEMALE";
  nationality?: string;
  cprNumber?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  weight?: number;
  height?: number;
  bloodType?: string;
  registrationDate?: string;
}

export interface PublicUserSummary {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  hasPlayerProfile: boolean;
  hasProfilePhoto: boolean;
  profilePhotoUrl: string | null;
}

/**
 * Static belt table seeded in BE (`V1__init_schema.sql`). BE doesn't expose a
 * GET /api/belts endpoint yet, so we mirror the seed here. `isBlack` triggers
 * the "submit black-belt certificate" extra step + PENDING status server-side.
 */
export interface BeltOption {
  beltId: number;
  label: { en: string; ar: string };
  isBlack: boolean;
}

export const BELTS: BeltOption[] = [
  { beltId: 1, label: { en: "Colored Belt", ar: "حزام ملوّن" }, isBlack: false },
  { beltId: 2, label: { en: "1st Dan Black Belt", ar: "حزام أسود ١ دان" }, isBlack: true },
  { beltId: 3, label: { en: "2nd Dan Black Belt", ar: "حزام أسود ٢ دان" }, isBlack: true },
  { beltId: 4, label: { en: "3rd Dan Black Belt", ar: "حزام أسود ٣ دان" }, isBlack: true },
  { beltId: 5, label: { en: "4th Dan Black Belt", ar: "حزام أسود ٤ دان" }, isBlack: true },
  { beltId: 6, label: { en: "5th Dan Black Belt", ar: "حزام أسود ٥ دان" }, isBlack: true },
  { beltId: 7, label: { en: "6th Dan Black Belt", ar: "حزام أسود ٦ دان" }, isBlack: true },
  { beltId: 8, label: { en: "7th Dan Black Belt", ar: "حزام أسود ٧ دان" }, isBlack: true },
  { beltId: 9, label: { en: "8th Dan Black Belt", ar: "حزام أسود ٨ دان" }, isBlack: true },
  { beltId: 10, label: { en: "9th Dan Black Belt", ar: "حزام أسود ٩ دان" }, isBlack: true },
];
