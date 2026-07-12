// Local storage of GoldTrade's own tokens (see AuthController#login).
// GoldTrade owns auth end-to-end, no Supabase Auth session involved.
//
// Two tokens: a short-lived access token (15 min) sent on every request, and a
// long-lived refresh token used only to silently mint new access tokens (see
// lib/api.ts). Keeping the access token short-lived means a stolen one is only
// useful for a few minutes; the refresh token is revocable server-side.

const TOKEN_KEY = "gt-access-token";
const REFRESH_TOKEN_KEY = "gt-refresh-token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function setSessionTokens(accessToken: string, refreshToken: string) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

export function clearSessionTokens() {
  clearAccessToken();
  clearRefreshToken();
}
