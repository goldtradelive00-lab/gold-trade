import { api } from "@/lib/api";
import { getRefreshToken, clearSessionTokens } from "@/lib/session";

// Best-effort revokes the refresh token server-side (so a copied/leaked token can't be
// silently renewed again) before clearing local storage. Never throws — a network hiccup
// during logout should never trap the user on the page.
export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await api.post("/api/auth/logout", { refresh_token: refreshToken });
    } catch {
      // ignore — clear local tokens regardless
    }
  }
  clearSessionTokens();
}
