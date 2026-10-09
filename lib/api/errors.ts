import { isAxiosError } from "axios";

/**
 * The backend answers business-rule failures with `{ message }` (e.g. "This
 * tournament is full."). Surface that text when present, else the fallback.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}
