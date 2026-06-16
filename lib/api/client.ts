import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("btf-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Don't redirect on auth endpoints — a 401 there is the legitimate
      // server response (bad credentials, invalid reset token, etc.) and the
      // calling page needs to show its own error UI. Only treat 401 as
      // "session expired" for endpoints that require an existing JWT.
      const url = error.config?.url ?? "";
      const isAuthEndpoint =
        url.includes("/api/auth/login") ||
        url.includes("/api/auth/register") ||
        url.includes("/api/auth/forgot-password") ||
        url.includes("/api/auth/reset-password") ||
        url.includes("/api/auth/verify-email") ||
        url.includes("/api/auth/resend-verification");

      if (!isAuthEndpoint) {
        localStorage.removeItem("btf-token");
        localStorage.removeItem("btf-user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
