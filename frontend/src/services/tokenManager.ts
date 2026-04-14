/**
 * In-memory access token manager.
 *
 * Access tokens are short-lived (15 min) and should NOT be stored in
 * localStorage where they are vulnerable to XSS.  This module keeps
 * the token in a closure variable — it survives across components but
 * is wiped on page refresh (which is fine: the HttpOnly refresh-token
 * cookie will silently issue a new access token).
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
