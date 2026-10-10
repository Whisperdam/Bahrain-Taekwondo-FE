import apiClient from "@/lib/api/client";
import type {
  CoachApplicationRequest,
  OfficialApplicationRequest,
  AcademyApplicationRequest,
  MyCoachApplication,
  MyOfficialApplication,
  MyAcademyApplication,
  ApplicationReceipt,
  DocumentSummary,
  DocumentOwnerType,
  DocumentType,
} from "@/types/applications";

export async function submitCoachApplication(
  data: CoachApplicationRequest,
): Promise<ApplicationReceipt> {
  const res = await apiClient.post<ApplicationReceipt>(
    "/api/applications/coach",
    data,
  );
  return res.data;
}

export async function submitOfficialApplication(
  data: OfficialApplicationRequest,
): Promise<ApplicationReceipt> {
  const res = await apiClient.post<ApplicationReceipt>(
    "/api/applications/official",
    data,
  );
  return res.data;
}

export async function submitAcademyApplication(
  data: AcademyApplicationRequest,
): Promise<ApplicationReceipt> {
  const res = await apiClient.post<ApplicationReceipt>(
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
export async function listMyCoachApplications(): Promise<MyCoachApplication[]> {
  const res = await apiClient.get<MyCoachApplication[]>(
    "/api/applications/coach/my",
  );
  return res.data;
}

export async function listMyOfficialApplications(): Promise<
  MyOfficialApplication[]
> {
  const res = await apiClient.get<MyOfficialApplication[]>(
    "/api/applications/official/my",
  );
  return res.data;
}

export async function listMyAcademyApplications(): Promise<
  MyAcademyApplication[]
> {
  const res = await apiClient.get<MyAcademyApplication[]>(
    "/api/applications/academy/my",
  );
  return res.data;
}

// ── Withdraw ────────────────────────────────────────────────────────────────
export async function withdrawCoachApplication(
  id: number,
): Promise<ApplicationReceipt> {
  const res = await apiClient.put<ApplicationReceipt>(
    `/api/applications/coach/${id}/withdraw`,
  );
  return res.data;
}

export async function withdrawOfficialApplication(
  id: number,
): Promise<ApplicationReceipt> {
  const res = await apiClient.put<ApplicationReceipt>(
    `/api/applications/official/${id}/withdraw`,
  );
  return res.data;
}

export async function withdrawAcademyApplication(
  id: number,
): Promise<ApplicationReceipt> {
  const res = await apiClient.put<ApplicationReceipt>(
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
