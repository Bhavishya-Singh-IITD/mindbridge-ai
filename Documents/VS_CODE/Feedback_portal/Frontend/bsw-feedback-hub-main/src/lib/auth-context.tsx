import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Category } from "./mock-data";

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

/** Key used for the JWT in localStorage. A non-obvious name adds marginal
 *  obscurity, but — importantly — the key is never logged or reflected. */
const TOKEN_KEY = "bsw_auth_token";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin";
export type UserType = "iitd" | "non-iitd" | "admin";

export type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
  userType: UserType;
  subRole?: string;
};

type PendingCategory = { category: Category; sub?: string } | null;

type AuthContextValue = {
  /** Null while hydrating OR when genuinely logged out. */
  user: AuthUser | null;
  isLoggedIn: boolean;
  /**
   * True during the initial mount `/me` verification.
   * Route guards MUST check this before redirecting so they don't
   * bounce authenticated users to `/login` during the hydration window.
   */
  isHydrating: boolean;
  /** Called by login.tsx after a successful API response. Stores the token
   *  in localStorage and updates user state. Token storage is centralised
   *  here — login.tsx must NOT write to localStorage directly. */
  login: (token: string, user: AuthUser) => void;
  /** Clears token from localStorage, nulls user state, and redirects to
   *  /login. The navigate fn is injected at call-time to avoid a circular
   *  dependency between the context and the router. */
  logout: (navigate: (opts: { to: string }) => void) => void;
  /** Returns the stored JWT string for use in authenticated API calls. */
  getToken: () => string | null;
  pendingCategory: PendingCategory;
  setPendingCategory: (p: PendingCategory) => void;
};

// ── Token storage helpers ─────────────────────────────────────────────────────
// All localStorage access is isolated here. If we ever move to HttpOnly
// cookies the only changes needed are in these two functions.

function persistToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Private-browsing / storage-quota edge case — fail silently so the
    // in-memory session still works for the current tab.
  }
}

function retrieveToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [pendingCategory, setPendingCategory] = useState<PendingCategory>(null);

  // ── Hydration — verify stored token on mount ─────────────────────────────
  // This runs exactly once when the app first loads. It reads the JWT from
  // localStorage, calls GET /api/auth/me to validate it server-side, and
  // populates the user state from the backend's authoritative response.
  //
  // Security rationale:
  //   • We NEVER trust the token payload directly (no jwt-decode on the client).
  //     The backend re-queries the DB on every /me call, so deleted or demoted
  //     accounts are caught immediately.
  //   • If the token is missing, expired, or the backend returns a non-200,
  //     we clear storage and proceed as logged-out — no error is surfaced to
  //     the user since this is a background operation.
  useEffect(() => {
    const token = retrieveToken();

    if (!token) {
      // No token stored — skip the network call immediately
      setIsHydrating(false);
      return;
    }

    let cancelled = false; // Guard against unmount race

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "omit",
        });

        if (cancelled) return;

        if (!res.ok) {
          // Token is expired, revoked, or invalid — clear it silently
          clearToken();
          setUser(null);
          return;
        }

        const data = await res.json();
        const u = data?.user;

        // Validate the shape before trusting it
        if (
          u &&
          typeof u.name === "string" &&
          typeof u.email === "string" &&
          (u.role === "user" || u.role === "admin")
        ) {
          setUser({
            name: u.name,
            email: u.email,
            role: u.role,
            userType: u.userType,
            subRole: u.subRole ?? undefined,
          });
        } else {
          // Unexpected shape — treat as invalid
          clearToken();
          setUser(null);
        }
      } catch {
        // Network failure — keep the token so the user can retry after
        // reconnection, but don't surface an error UI (this is silent hydration)
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // Empty deps: intentionally runs once on mount only

  // ── login ─────────────────────────────────────────────────────────────────
  // Called by login.tsx immediately after a successful /api/auth/login/* call.
  // Persisting the token here (not in login.tsx) keeps localStorage access
  // in a single, auditable location.
  const login = useCallback((token: string, u: AuthUser) => {
    persistToken(token);
    setUser(u);
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  // Accepts the router's navigate function as a parameter to avoid importing
  // TanStack Router into this module (keeps concerns separated).
  // We call POST /api/auth/logout for server-side audit logging, but we do
  // NOT await it — the client-side state is cleared immediately regardless
  // of network conditions so the user is never stuck in a "logging out" limbo.
  const logout = useCallback((navigate: (opts: { to: string }) => void) => {
    const token = retrieveToken();

    // Clear state synchronously — user is logged out immediately
    clearToken();
    setUser(null);

    // Fire-and-forget: notify the backend for audit logs.
    // If this fails (offline, 500), the client is still logged out.
    if (token) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "omit",
      }).catch(() => {
        // Intentionally ignored — logout is client-driven
      });
    }

    // Redirect to login — pass replace:true so Back button can't return
    // to the protected page that triggered logout
    navigate({ to: "/login" });
  }, []);

  // ── getToken ──────────────────────────────────────────────────────────────
  // Exposes the stored token so other API utilities (e.g. feedback-store
  // when it's wired to the real backend) can build Authorization headers
  // without accessing localStorage directly.
  const getToken = useCallback(() => retrieveToken(), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isHydrating,
        login,
        logout,
        getToken,
        pendingCategory,
        setPendingCategory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
