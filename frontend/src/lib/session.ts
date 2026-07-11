// Local storage of the backend-issued JWT (see AuthController#login).
// GoldTrade owns auth end-to-end — no Supabase Auth session involved.

const TOKEN_KEY = "gt-access-token";

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
