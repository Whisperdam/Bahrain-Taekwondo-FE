/**
 * Lightweight client-side JWT helpers. We only decode the payload to read the
 * `exp` claim — we do NOT verify the signature (the server does that on every
 * request). This is purely to avoid showing authenticated UI with a token we
 * already know is expired.
 */

interface JwtPayload {
  exp?: number; // seconds since epoch
  [key: string]: unknown;
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    // base64url -> base64
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true when the token is missing, malformed, or past its `exp`.
 * A small clock-skew buffer means we treat a token expiring within the next
 * few seconds as already expired.
 */
export function isTokenExpired(token: string | null, skewSeconds = 5): boolean {
  if (!token) return true;
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== "number") {
    // No exp claim we can read — treat as expired so we fail safe to /login.
    return true;
  }
  const nowSeconds = Date.now() / 1000;
  return payload.exp <= nowSeconds + skewSeconds;
}
