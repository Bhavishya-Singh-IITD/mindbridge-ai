import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FeedbackCard } from "@/components/FeedbackCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import type { Category, Feedback } from "@/lib/mock-data";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

// Must match TOKEN_KEY in auth-context.tsx (line 17)
const TOKEN_KEY = "bsw_auth_token";

export const Route = createFileRoute("/admin/all-feedbacks")({
  head: () => ({
    meta: [{ title: "All Feedbacks — BSW Admin" }],
  }),
  component: AllFeedbacksPage,
});

function AllFeedbacksPage() {
  const { user, isHydrating } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Category | null>(null);

  // ── Fetch all feedbacks for the selected category from the admin endpoint ──
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected || !user) return;

    // Read the token directly from localStorage using the exact known key
    const token = localStorage.getItem(TOKEN_KEY);

    // ── DEBUG LOGS ────────────────────────────────────────────────────────────
    if (!token) {
      console.warn(
        "[admin/all-feedbacks] ❌ Token is MISSING from localStorage.",
        "\n  Key used:", TOKEN_KEY,
        "\n  All current localStorage keys:", Object.keys(localStorage),
      );
      navigate({ to: "/login" });
      return;
    }

    console.log(
      "[admin/all-feedbacks] ✅ Token found in localStorage.",
      "\n  Key:", TOKEN_KEY,
      "\n  Token (first 30 chars):", token.slice(0, 30) + "...",
      "\n  Authorization header being sent:", `Bearer ${token.slice(0, 30)}...`,
      "\n  Fetching category:", selected,
    );
    // ─────────────────────────────────────────────────────────────────────────

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setFeedbacks([]);

    const url = new URL(`${API_BASE}/api/feedbacks`);
    url.searchParams.set("category", selected);

    console.log("[admin/all-feedbacks] GET", url.toString());

    fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "omit",
    })
      .then(async (res) => {
        console.log("[admin/all-feedbacks] Response status:", res.status);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error("[admin/all-feedbacks] ❌ Error response body:", body);
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log(
          "[admin/all-feedbacks] ✅ Success — feedbacks received:",
          data.feedbacks?.length ?? 0,
        );
        if (!cancelled) setFeedbacks(data.feedbacks ?? []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load feedbacks.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected, user, navigate]);

  if (isHydrating) return null;
  if (!user || user.role !== "admin") return <Navigate to="/login" />;

  // ── Category picker ────────────────────────────────────────────────────────
  if (!selected) {
    return (
      <PageContainer>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">All Feedbacks</h1>
            <p className="mt-1 text-sm text-gray-300">
              Pick a category to view every feedback submitted under it.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/admin" })}
            className="border-slate-700/60 bg-transparent text-white hover:bg-slate-700/40"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <CategoryGrid onSelect={(cat) => setSelected(cat)} />
      </PageContainer>
    );
  }

  // ── Category detail view ───────────────────────────────────────────────────
  return (
    <PageContainer>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setSelected(null)}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All categories
          </button>
          <h1 className="text-3xl font-bold text-white">{selected}</h1>
          {!isLoading && !error && (
            <p className="mt-1 text-sm text-gray-300">
              {feedbacks.length} feedback{feedbacks.length === 1 ? "" : "s"} submitted
            </p>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading feedbacks…
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-900/20 px-6 py-5 text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && feedbacks.length === 0 && (
        <div className="rounded-3xl border border-slate-700/50 bg-slate-800 px-6 py-14 text-center text-gray-300">
          No feedback under this category yet.
        </div>
      )}

      {/* Feedback list */}
      {!isLoading && !error && feedbacks.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          {feedbacks.map((fb) => (
            <FeedbackCard key={fb.id} feedback={fb} variant="admin" />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
