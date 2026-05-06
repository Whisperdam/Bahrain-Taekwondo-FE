import apiClient from "@/lib/api/client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ApiResponse,
  UserProfile,
  ResetPasswordRequest,
} from "@/types/auth";

export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/api/auth/login", data);
  return res.data;
}

export async function registerApi(data: RegisterRequest): Promise<ApiResponse> {
  const res = await apiClient.post<ApiResponse>("/api/auth/register", data);
  return res.data;
}

export async function forgotPasswordApi(email: string): Promise<ApiResponse> {
  const res = await apiClient.post<ApiResponse>("/api/auth/forgot-password", { email });
  return res.data;
}

export async function resetPasswordApi(data: ResetPasswordRequest): Promise<ApiResponse> {
  const res = await apiClient.post<ApiResponse>("/api/auth/reset-password", data);
  return res.data;
}

export async function getMeApi(): Promise<UserProfile> {
  const res = await apiClient.get<UserProfile>("/api/auth/me");
  return res.data;
}

export async function resendVerificationApi(email: string): Promise<ApiResponse> {
  const res = await apiClient.post<ApiResponse>("/api/auth/resend-verification", { email });
  return res.data;
}
