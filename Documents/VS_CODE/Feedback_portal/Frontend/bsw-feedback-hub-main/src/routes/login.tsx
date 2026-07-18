import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — BSW Feedback Portal" },
      { name: "description", content: "Log in to submit feedback to BSW." },
    ],
  }),
  component: LoginPage,
});

// ── Constants ─────────────────────────────────────────────────────────────────

type Mode = "user" | "admin";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

// Generic network/server error message — never expose raw API error details
// from non-validation failures to avoid information leakage.
const GENERIC_ERROR = "Something went wrong. Please try again.";

// ── API helpers ───────────────────────────────────────────────────────────────

/**
 * Central fetch wrapper for all auth calls.
 * - Throws a user-safe string on any non-2xx response.
 * - On 422 (validation), surfaces the first field-level message from the backend.
 * - On network failure, surfaces a generic message (never exposes stack traces).
 */
async function authFetch<T>(path: string, body: Record<string, string>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Prevent CSRF — credentials are NOT sent; auth is token-based only.
      credentials: "omit",
    });
  } catch {
    // Network-level failure (backend down, DNS, etc.) — never expose internals
    throw new Error(GENERIC_ERROR);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 422 && Array.isArray(data?.details) && data.details.length > 0) {
      // Surface the first backend validation message (field + message)
      const first = data.details[0];
      throw new Error(first.message ?? GENERIC_ERROR);
    }
    // 401, 429, 500, etc. — use the backend's top-level `error` string if
    // present, but only if it's a plain string (guard against object injection)
    const msg = typeof data?.error === "string" ? data.error : GENERIC_ERROR;
    throw new Error(msg);
  }

  return data as T;
}

// Shape of the successful auth response from the backend
interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    userType: "iitd" | "non-iitd" | "admin";
    subRole?: string;
  };
}

// ── Client-side validation helpers ───────────────────────────────────────────
// These run before the network request to give instant feedback and to avoid
// wasting rate-limit budget on obviously invalid inputs.

function validateIitdForm(email: string, password: string): string | null {
  if (!email.trim()) return "Please enter your IITD email.";
  if (!email.toLowerCase().endsWith("@iitd.ac.in"))
    return "Email must be an @iitd.ac.in address.";
  if (!password) return "Please enter your password.";
  return null;
}

function validateNonIitdForm(
  name: string,
  email: string,
  password: string
): string | null {
  if (!name.trim()) return "Please enter your name.";
  if (name.trim().length > 100) return "Name must be 100 characters or fewer.";
  if (!email.trim()) return "Please enter your email.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (password.length > 128) return "Password must be 128 characters or fewer.";
  return null;
}

function validateAdminForm(email: string, password: string): string | null {
  if (!email.trim()) return "Please enter your admin email.";
  if (!password) return "Please enter your password.";
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

function LoginPage() {
  const [mode, setMode] = useState<Mode>("user");
  const { login, pendingCategory, setPendingCategory } = useAuth();
  const navigate = useNavigate();

  // IITD form
  const [iitdEmail, setIitdEmail] = useState("");
  const [iitdPw, setIitdPw] = useState("");

  // Non-IITD form
  const [nName, setNName] = useState("");
  const [nEmail, setNEmail] = useState("");
  const [nPw, setNPw] = useState("");
  const [nRole, setNRole] = useState<string>("Student");

  // Admin form
  const [aEmail, setAEmail] = useState("");
  const [aPw, setAPw] = useState("");

  // Shared submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Shared post-login navigation ──────────────────────────────────────────
  function redirectAfterLogin(role: "user" | "admin") {
    if (role === "admin") {
      navigate({ to: "/admin" });
      return;
    }
    if (pendingCategory) {
      const p = pendingCategory;
      setPendingCategory(null);
      navigate({ to: "/submit-feedback", search: { category: p.category, sub: p.sub } });
    } else {
      navigate({ to: "/" });
    }
  }

  // ── IITD Login ────────────────────────────────────────────────────────────
  const handleIitdLogin = async () => {
    setError(null);
    const validationError = validateIitdForm(iitdEmail, iitdPw);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const { token, user } = await authFetch<AuthResponse>("/api/auth/login/iitd", {
        email: iitdEmail.trim().toLowerCase(),
        password: iitdPw,
      });
      // Token storage is handled inside login() — no direct localStorage access here
      login(token, { name: user.name, email: user.email, role: user.role, userType: user.userType, subRole: user.subRole });
      redirectAfterLogin(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // ── Non-IITD Login ────────────────────────────────────────────────────────
  const handleNonIitdLogin = async () => {
    setError(null);
    const validationError = validateNonIitdForm(nName, nEmail, nPw);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const { token, user } = await authFetch<AuthResponse>("/api/auth/login/non-iitd", {
        name: nName.trim(),
        email: nEmail.trim().toLowerCase(),
        password: nPw,
        subRole: nRole,
      });
      login(token, { name: user.name, email: user.email, role: user.role, userType: user.userType, subRole: user.subRole });
      redirectAfterLogin(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // ── Admin Login ───────────────────────────────────────────────────────────
  const handleAdminLogin = async () => {
    setError(null);
    const validationError = validateAdminForm(aEmail, aPw);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const { token, user } = await authFetch<AuthResponse>("/api/auth/login/admin", {
        email: aEmail.trim().toLowerCase(),
        password: aPw,
      });
      // Defensive guard — backend already enforces this, but we double-check
      // so the client never grants admin UI to a non-admin JWT.
      if (user.role !== "admin") {
        throw new Error("Invalid credentials.");
      }
      login(token, { name: user.name, email: user.email, role: user.role, userType: user.userType, subRole: user.subRole });
      redirectAfterLogin(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // ── Mode switch clears errors and password fields ─────────────────────────
  const handleModeChange = (m: Mode) => {
    setMode(m);
    setError(null);
    // Clear password fields on tab switch to prevent accidental credential leakage
    setIitdPw("");
    setNPw("");
    setAPw("");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageContainer className="max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-slate-700/50 bg-slate-800 p-6 shadow-xl sm:p-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-300">Sign in to continue to BSW Feedback</p>
        </div>

        {/* Mode toggle */}
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-900/60 p-1 text-sm">
          {(["user", "admin"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              disabled={loading}
              className={cn(
                "rounded-lg px-3 py-2 font-medium transition-colors disabled:opacity-60",
                mode === m
                  ? "bg-[#1a936f] text-white shadow"
                  : "text-gray-300 hover:text-white"
              )}
            >
              {m === "user" ? "Login as User" : "Login as Admin"}
            </button>
          ))}
        </div>

        {/* Shared error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {mode === "user" ? (
          <Tabs defaultValue="iitd" className="mt-6" onValueChange={() => setError(null)}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/60">
              <TabsTrigger
                value="iitd"
                className="data-[state=active]:bg-[#1a936f] data-[state=active]:text-white"
              >
                IITD Email
              </TabsTrigger>
              <TabsTrigger
                value="non"
                className="data-[state=active]:bg-[#1a936f] data-[state=active]:text-white"
              >
                Non-IITD Email
              </TabsTrigger>
            </TabsList>

            {/* ── IITD tab ── */}
            <TabsContent value="iitd" className="mt-5 space-y-4">
              <Field label="IITD Email ID" htmlFor="iitd-email">
                <Input
                  id="iitd-email"
                  type="email"
                  placeholder="cs21b001@iitd.ac.in"
                  value={iitdEmail}
                  onChange={(e) => { setIitdEmail(e.target.value); setError(null); }}
                  autoComplete="username"
                  disabled={loading}
                  className="border-slate-700/60 bg-slate-900/60 text-white placeholder:text-gray-500"
                />
              </Field>
              <Field label="Kerberos Password" htmlFor="iitd-password">
                <Input
                  id="iitd-password"
                  type="password"
                  placeholder="••••••••"
                  value={iitdPw}
                  onChange={(e) => { setIitdPw(e.target.value); setError(null); }}
                  autoComplete="current-password"
                  disabled={loading}
                  onKeyDown={(e) => { if (e.key === "Enter") handleIitdLogin(); }}
                  className="border-slate-700/60 bg-slate-900/60 text-white placeholder:text-gray-500"
                />
              </Field>
              <SignInButton onClick={handleIitdLogin} loading={loading} />
            </TabsContent>

            {/* ── Non-IITD tab ── */}
            <TabsContent value="non" className="mt-5 space-y-4">
              <Field label="Name" htmlFor="non-name">
                <Input
                  id="non-name"
                  value={nName}
                  onChange={(e) => { setNName(e.target.value); setError(null); }}
                  placeholder="Your full name"
                  disabled={loading}
                  className="border-slate-700/60 bg-slate-900/60 text-white placeholder:text-gray-500"
                />
              </Field>
              <Field label="Email ID" htmlFor="non-email">
                <Input
                  id="non-email"
                  type="email"
                  value={nEmail}
                  onChange={(e) => { setNEmail(e.target.value); setError(null); }}
                  placeholder="you@example.com"
                  autoComplete="username"
                  disabled={loading}
                  className="border-slate-700/60 bg-slate-900/60 text-white placeholder:text-gray-500"
                />
              </Field>
              <Field label="Password" htmlFor="non-password">
                <Input
                  id="non-password"
                  type="password"
                  value={nPw}
                  onChange={(e) => { setNPw(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  onKeyDown={(e) => { if (e.key === "Enter") handleNonIitdLogin(); }}
                  className="border-slate-700/60 bg-slate-900/60 text-white placeholder:text-gray-500"
                />
              </Field>
              <Field label="Role" htmlFor="non-role">
                <Select value={nRole} onValueChange={setNRole} disabled={loading}>
                  <SelectTrigger id="non-role" className="border-slate-700/60 bg-slate-900/60 text-white">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700/60 bg-slate-800 text-white">
                    {["Student", "Parent", "Professor", "TA", "Other"].map((r) => (
                      <SelectItem key={r} value={r} className="focus:bg-slate-700/60 focus:text-white">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <SignInButton onClick={handleNonIitdLogin} loading={loading} />
            </TabsContent>
          </Tabs>
        ) : (
          /* ── Admin panel ── */
          <div className="mt-6 space-y-4">
            <Field label="Admin Email" htmlFor="admin-email">
              <Input
                id="admin-email"
                type="email"
                value={aEmail}
                onChange={(e) => { setAEmail(e.target.value); setError(null); }}
                placeholder="admin@iitd.ac.in"
                autoComplete="username"
                disabled={loading}
                className="border-slate-700/60 bg-slate-900/60 text-white placeholder:text-gray-500"
              />
            </Field>
            <Field label="Password" htmlFor="admin-password">
              <Input
                id="admin-password"
                type="password"
                value={aPw}
                onChange={(e) => { setAPw(e.target.value); setError(null); }}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); }}
                className="border-slate-700/60 bg-slate-900/60 text-white placeholder:text-gray-500"
              />
            </Field>
            <SignInButton onClick={handleAdminLogin} loading={loading} />
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-gray-300">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SignInButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-[#1a936f] py-6 text-base font-semibold text-white shadow hover:bg-[#157a5b] disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in…
        </span>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}
