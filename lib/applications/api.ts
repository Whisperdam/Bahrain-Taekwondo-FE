import apiClient from "@/lib/api/client";
import type {
  CoachApplicationRequest,
  CoachApplicationDetail,
  CoachApplicationSummary,
  OfficialApplicationRequest,
  OfficialApplicationDetail,
  OfficialApplicationSummary,
  AcademyApplicationRequest,
  AcademyApplicationDetail,
  AcademyApplicationSummary,
  DocumentSummary,
  DocumentOwnerType,
  DocumentType,
} from "@/types/applications";

export async function submitCoachApplication(
  data: CoachApplicationRequest,
): Promise<CoachApplicationDetail> {
  const res = await apiClient.post<CoachApplicationDetail>(
    "/api/applications/coach",
    data,
  );
  return res.data;
}

export async function submitOfficialApplication(
  data: OfficialApplicationRequest,
): Promise<OfficialApplicationDetail> {
  const res = await apiClient.post<OfficialApplicationDetail>(
    "/api/applications/official",
    data,
  );
  return res.data;
}

export async function submitAcademyApplication(
  data: AcademyApplicationRequest,
): Promise<AcademyApplicationDetail> {
  const res = await apiClient.post<AcademyApplicationDetail>(
    "/api/applications/academy",
    data,
  );
  return res.data;
}

export interface UploadDocumentParams {
  file: File;
  ownerType: DocumentOwnerType;
  ownerId: number;
  documentType: DocumentType;
}

// ── List "my applications" ──────────────────────────────────────────────────
export async function listMyCoachApplications(): Promise<CoachApplicationSummary[]> {
  const res = await apiClient.get<CoachApplicationSummary[]>(
    "/api/applications/coach/my",
  );
  return res.data;
}

export async function listMyOfficialApplications(): Promise<
  OfficialApplicationSummary[]
> {
  const res = await apiClient.get<OfficialApplicationSummary[]>(
    "/api/applications/official/my",
  );
  return res.data;
}

export async function listMyAcademyApplications(): Promise<
  AcademyApplicationSummary[]
> {
  const res = await apiClient.get<AcademyApplicationSummary[]>(
    "/api/applications/academy/my",
  );
  return res.data;
}

// ── Withdraw ────────────────────────────────────────────────────────────────
export async function withdrawCoachApplication(
  id: number,
): Promise<CoachApplicationDetail> {
  const res = await apiClient.put<CoachApplicationDetail>(
    `/api/applications/coach/${id}/withdraw`,
  );
  return res.data;
}

export async function withdrawOfficialApplication(
  id: number,
): Promise<OfficialApplicationDetail> {
  const res = await apiClient.put<OfficialApplicationDetail>(
    `/api/applications/official/${id}/withdraw`,
  );
  return res.data;
}

export async function withdrawAcademyApplication(
  id: number,
): Promise<AcademyApplicationDetail> {
  const res = await apiClient.put<AcademyApplicationDetail>(
    `/api/applications/academy/${id}/withdraw`,
  );
  return res.data;
}

export interface DocumentUrl {
  url: string;
  expiresInSeconds?: number;
}

export async function getDocumentUrl(id: number): Promise<DocumentUrl> {
  const res = await apiClient.get<DocumentUrl>(`/api/documents/${id}/url`);
  return res.data;
}

export async function uploadDocument({
  file,
  ownerType,
  ownerId,
  documentType,
}: UploadDocumentParams): Promise<DocumentSummary> {
  const form = new FormData();
  form.append("file", file);
  form.append("ownerType", ownerType);
  form.append("ownerId", String(ownerId));
  form.append("documentType", documentType);
  const res = await apiClient.post<DocumentSummary>("/api/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
