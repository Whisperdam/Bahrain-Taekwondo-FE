// Mirrors backend DTOs in dto/application/* and dto/admin/*
// Endpoints:
//   POST /api/applications/coach     -> CoachApplicationDetailDTO
//   POST /api/applications/official  -> OfficialApplicationDetailDTO
//   POST /api/applications/academy   -> AcademyApplicationDetailDTO
//   POST /api/documents/upload (multipart) -> DocumentSummaryDTO

export type Gender = "MALE" | "FEMALE";

export type ApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

export type DocumentType =
  | "NATIONAL_ID"
  | "PASSPORT"
  | "COACH_CERT"
  | "TRADE_LICENSE"
  | "ACADEMY_REGISTRATION"
  | "INSURANCE"
  | "BLACK_BELT_CERT"
  | "POOM_CERT"
  | "DAN_PROMOTION_CERT"
  | "REFEREE_CERT"
  | "OTHER";

export type DocumentOwnerType =
  | "COACH_APPLICATION"
  | "ACADEMY_APPLICATION"
  | "OFFICIAL_APPLICATION"
  | "PLAYER"
  | "USER";

export type OfficialCertLevel = "NATIONAL" | "REGIONAL" | "INTERNATIONAL";
export type OfficialSpecialization = "REFEREE" | "JUDGE" | "COACH_REFEREE";

// ── Coach ───────────────────────────────────────────────────────────────────
export interface CoachApplicationRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date (YYYY-MM-DD)
  gender: Gender;
  nationality?: string;
  cprNumber?: string;
  phone: string;
  email?: string;
  certificationLevel?: string;
  certificationNumber?: string;
  certificationDate?: string;
  yearsExperience?: number;
  specialization?: string;
  notes?: string;
}

// ── Official ────────────────────────────────────────────────────────────────
export interface OfficialApplicationRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: Gender;
  nationality?: string;
  phone?: string;
  email?: string;
  certificationLevel?: OfficialCertLevel;
  certificationExpiry?: string;
  specialization?: OfficialSpecialization;
  notes?: string;
}

// ── Academy ─────────────────────────────────────────────────────────────────
export interface AcademyApplicationRequest {
  proposedName: string;
  proposedLocation?: string;
  proposedPhone?: string;
  proposedEmail?: string;
  proposedEstablishedDate?: string;
  notes?: string;
}

// ── Document upload ─────────────────────────────────────────────────────────
export interface DocumentSummary {
  documentId: number;
  fileName: string;
  documentType: DocumentType;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  verified: boolean | null;
}

// ── Application list responses (summary rows) ──────────────────────────────
export interface CoachApplicationSummary {
  applicationId: number;
  userId: number;
  username: string;
  applicantFirstName: string;
  applicantLastName: string;
  email: string | null;
  phone: string | null;
  certificationLevel: string | null;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface OfficialApplicationSummary {
  applicationId: number;
  userId: number;
  username: string;
  applicantFirstName: string;
  applicantLastName: string;
  email: string | null;
  phone: string | null;
  certificationLevel: OfficialCertLevel | null;
  specialization: OfficialSpecialization | null;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface AcademyApplicationSummary {
  applicationId: number;
  applicantCoachId: number;
  applicantCoachName: string;
  proposedName: string;
  proposedLocation: string | null;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt: string | null;
}

/** Unified row used by the "My Applications" list. */
export type ApplicationType = "COACH" | "OFFICIAL" | "ACADEMY";

export interface ApplicationListItem {
  type: ApplicationType;
  applicationId: number;
  status: ApplicationStatus;
  submittedAt: string;
  summary: string;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
}

// ── Application detail responses ────────────────────────────────────────────
export interface ApplicationDetailBase {
  applicationId: number;
  userId: number;
  username: string;
  userEmail: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  documents: DocumentSummary[];
}

export interface CoachApplicationDetail extends ApplicationDetailBase {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  nationality: string | null;
  cprNumber: string | null;
  phone: string;
  email: string | null;
  certificationLevel: string | null;
  certificationNumber: string | null;
  certificationDate: string | null;
  yearsExperience: number | null;
  specialization: string | null;
  notes: string | null;
  createdCoachId: number | null;
}

export interface OfficialApplicationDetail extends ApplicationDetailBase {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  nationality: string | null;
  phone: string | null;
  email: string | null;
  certificationLevel: OfficialCertLevel | null;
  certificationExpiry: string | null;
  specialization: OfficialSpecialization | null;
  notes: string | null;
  createdOfficialId: number | null;
}

export interface AcademyApplicationDetail extends ApplicationDetailBase {
  proposedName: string;
  proposedLocation: string | null;
  proposedPhone: string | null;
  proposedEmail: string | null;
  proposedEstablishedDate: string | null;
  notes: string | null;
  createdAcademyId: number | null;
}
