import apiClient from "@/lib/api/client";
import type { DocumentSummary } from "@/types/applications";
import type { ApiResponse, LoginResponse, UserProfile } from "@/types/auth";
import type { MyPlayer, MyProfile, PlayerDetailsUpdate } from "@/types/profile";

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

// ── Editing my own profile ─────────────────────────────────────────────────
// Each change has its own endpoint and its own limit on the server.

export async function fetchMyProfile(): Promise<MyProfile> {
  const res = await apiClient.get<MyProfile>("/api/users/me/profile");
  return res.data;
}

export async function changeMyName(body: {
  firstName: string;
  lastName: string;
}): Promise<UserProfile> {
  const res = await apiClient.put<UserProfile>("/api/users/me/name", body);
  return res.data;
}

/** Answers with a new token: the old one was issued for the old username. */
export async function changeMyUsername(body: {
  username: string;
  currentPassword: string;
}): Promise<LoginResponse> {
  const res = await apiClient.put<LoginResponse>("/api/users/me/username", body);
  return res.data;
}

/** The email only changes once the link sent to the new address is opened. */
export async function requestMyEmailChange(body: {
  newEmail: string;
  currentPassword: string;
}): Promise<ApiResponse> {
  const res = await apiClient.post<ApiResponse>("/api/users/me/email", body);
  return res.data;
}

export async function changeMyPassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse> {
  const res = await apiClient.put<ApiResponse>("/api/users/me/password", body);
  return res.data;
}

export async function updateMyPlayerDetails(body: PlayerDetailsUpdate): Promise<MyPlayer> {
  const res = await apiClient.put<MyPlayer>("/api/players/me", body);
  return res.data;
}
