import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type Category,
  type Feedback,
  type FeedbackStatus,
} from "./mock-data";
import { useAuth } from "./auth-context";

// ── API base (same source as auth-context) ────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

// ── Types ─────────────────────────────────────────────────────────────────────

type NewFeedback = {
  category: Category;
  subCategory?: string;
  title: string;
  description: string;
  otherComments?: string;
  driveLink?: string;
  /** Raw File objects to upload as multipart/form-data */
  files?: File[];
};

type FeedbackContextValue = {
  feedbacks: Feedback[];
  isLoading: boolean;
  error: string | null;
  /**
   * POSTs to POST /api/feedbacks and refreshes the local list on success.
   * Returns the created Feedback or throws on failure.
   */
  addFeedback: (fb: NewFeedback) => Promise<Feedback>;
  /**
   * Updates a feedback's status via PATCH /api/feedbacks/:id/status.
   * Admin-only — backend enforces requireAdmin().
   */
  updateStatus: (id: string, status: FeedbackStatus) => Promise<void>;
  /**
   * Re-fetches the current user's feedbacks from GET /api/feedbacks/mine.
   */
  fetchMyFeedbacks: () => Promise<void>;
  getMine: (email: string) => Feedback[];
  getByCategory: (category: Category) => Feedback[];
};

// ── Typed error ───────────────────────────────────────────────────────────────

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, getToken } = useAuth();

  // ── fetchMyFeedbacks ──────────────────────────────────────────────────────
  // Calls GET /api/feedbacks/mine and replaces local state with the result.
  const fetchMyFeedbacks = useCallback(async () => {
    const token = getToken();
    if (!token || !user) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/feedbacks/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "omit",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      setFeedbacks(data.feedbacks ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load feedbacks.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user, getToken]);

  // ── Auto-fetch when the authenticated user changes ────────────────────────
  // Runs on mount (after hydration) and whenever the user logs in / out.
  useEffect(() => {
    if (user) {
      fetchMyFeedbacks();
    } else {
      // Clear stale feedbacks when logged out
      setFeedbacks([]);
    }
  }, [user, fetchMyFeedbacks]);

  // ── addFeedback ───────────────────────────────────────────────────────────
  // Sends a multipart/form-data POST to the real backend.
  // On success it prepends the new feedback to local state so the UI
  // updates immediately without an extra network round-trip.
  const addFeedback = useCallback(
    async (fb: NewFeedback): Promise<Feedback> => {
      const token = getToken();
      if (!token || !user) {
        throw new UnauthorizedError(
          "addFeedback: no active session. You must be logged in to submit feedback."
        );
      }

      const form = new FormData();
      form.append("category",    fb.category);
      form.append("title",       fb.title);
      form.append("description", fb.description);
      if (fb.subCategory)   form.append("subCategory",   fb.subCategory);
      if (fb.otherComments) form.append("otherComments", fb.otherComments);
      if (fb.driveLink)     form.append("driveLink",     fb.driveLink);
      if (fb.files) {
        fb.files.forEach((file) => form.append("attachments", file));
      }

      const res = await fetch(`${API_BASE}/api/feedbacks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        // Do NOT set Content-Type — browser sets it automatically with the
        // correct multipart boundary when using FormData.
        body: form,
        credentials: "omit",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}: Failed to submit feedback.`);
      }

      const data = await res.json();
      const created: Feedback = data.feedback;

      // Optimistically prepend to local list
      setFeedbacks((prev) => [created, ...prev]);

      return created;
    },
    [user, getToken]
  );

  // ── updateStatus ──────────────────────────────────────────────────────────
  // Calls PATCH /api/feedbacks/:id/status. Backend enforces requireAdmin().
  const updateStatus = useCallback(
    async (id: string, status: FeedbackStatus) => {
      const token = getToken();
      if (!token || !user) {
        throw new UnauthorizedError("updateStatus: no active session.");
      }

      const res = await fetch(`${API_BASE}/api/feedbacks/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "omit",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}: Failed to update status.`);
      }

      const data = await res.json();
      const updated: Feedback = data.feedback;

      setFeedbacks((prev) =>
        prev.map((fb) => (fb.id === updated.id ? updated : fb))
      );
    },
    [user, getToken]
  );

  // ── Read helpers ──────────────────────────────────────────────────────────
  const getMine = useCallback(
    (email: string) =>
      feedbacks
        .filter((f) => f.userEmail.toLowerCase() === email.toLowerCase())
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [feedbacks]
  );

  const getByCategory = useCallback(
    (category: Category) =>
      feedbacks
        .filter((f) => f.category === category)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [feedbacks]
  );

  return (
    <FeedbackContext.Provider
      value={{ feedbacks, isLoading, error, addFeedback, updateStatus, fetchMyFeedbacks, getMine, getByCategory }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useFeedbacks() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedbacks must be used inside FeedbackProvider");
  return ctx;
}

export function useMyFeedbacks() {
  const { user } = useAuth();
  const { getMine } = useFeedbacks();
  return user ? getMine(user.email) : [];
}
