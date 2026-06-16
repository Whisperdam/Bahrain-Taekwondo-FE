import apiClient from "@/lib/api/client";
import type { DocumentSummary } from "@/types/applications";

export async function uploadProfilePhoto(file: File): Promise<DocumentSummary> {
  const form = new FormData();
  form.append("file", file);
  // IMPORTANT: do not set Content-Type manually. axios/browser must generate
  // it as `multipart/form-data; boundary=...` from the FormData payload.
  // Forcing `multipart/form-data` without a boundary breaks the request.
  const res = await apiClient.post<DocumentSummary>(
    "/api/users/me/profile-photo",
    form,
  );
  return res.data;
}

export async function removeProfilePhoto(): Promise<void> {
  await apiClient.delete("/api/users/me/profile-photo");
}

/**
 * Coach/admin uploads a profile photo on behalf of another user (used by the
 * "add player" flow when the new player has no photo yet).
 */
export async function uploadProfilePhotoFor(
  userId: number,
  file: File,
): Promise<DocumentSummary> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post<DocumentSummary>(
    `/api/users/${userId}/profile-photo`,
    form,
  );
  return res.data;
}
