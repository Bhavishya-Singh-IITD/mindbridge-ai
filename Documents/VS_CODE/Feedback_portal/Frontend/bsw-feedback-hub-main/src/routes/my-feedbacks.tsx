import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Inbox, RefreshCw } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { FeedbackCard } from "@/components/FeedbackCard";
import { useAuth } from "@/lib/auth-context";
import { useMyFeedbacks, useFeedbacks } from "@/lib/feedback-store";

export const Route = createFileRoute("/my-feedbacks")({
  head: () => ({
    meta: [{ title: "My Feedbacks — BSW Feedback Portal" }],
  }),
  component: MyFeedbacksPage,
});

function MyFeedbacksPage() {
  const { isLoggedIn, isHydrating } = useAuth();
  const feedbacks = useMyFeedbacks();
  const { isLoading, error, fetchMyFeedbacks } = useFeedbacks();
  const navigate = useNavigate();

  if (isHydrating) return null;

  if (!isLoggedIn) return <Navigate to="/login" />;

  return (
    <PageContainer>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Feedbacks</h1>
          <p className="mt-1 text-sm text-gray-300">
            A record of everything you've shared with BSW.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => fetchMyFeedbacks()}
            disabled={isLoading}
            variant="outline"
            className="border-slate-600 bg-transparent text-gray-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing…" : "Refresh"}
          </Button>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="bg-[#1a936f] text-white hover:bg-[#157a5b]"
          >
            Submit new feedback
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 px-5 py-4 text-sm text-red-400 ring-1 ring-red-500/25">
          {error}
        </div>
      )}

      {isLoading && feedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-700/50 bg-slate-800 px-6 py-16 text-center">
          <RefreshCw className="mb-4 h-8 w-8 animate-spin text-[#2dd4bf]" />
          <p className="text-sm text-gray-300">Loading your feedbacks…</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-700/50 bg-slate-800 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a936f]/15 text-[#2dd4bf]">
            <Inbox className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">No feedback yet</h2>
          <p className="mt-1 text-sm text-gray-300">
            When you submit feedback, it'll show up here.
          </p>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="mt-6 bg-[#1a936f] text-white hover:bg-[#157a5b]"
          >
            Get started
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {feedbacks.map((fb) => (
            <FeedbackCard key={fb.id} feedback={fb} variant="user" />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
