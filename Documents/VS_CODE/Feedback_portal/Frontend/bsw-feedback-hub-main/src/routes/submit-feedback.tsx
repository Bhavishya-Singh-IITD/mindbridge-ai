import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/PageContainer";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { useFeedbacks } from "@/lib/feedback-store";
import { CATEGORIES, type Category } from "@/lib/mock-data";

type SearchParams = { category?: Category; sub?: string };

export const Route = createFileRoute("/submit-feedback")({
  head: () => ({
    meta: [
      { title: "Submit Feedback — BSW Feedback Portal" },
      { name: "description", content: "Share your feedback with BSW." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const c = search.category;
    const category =
      typeof c === "string" && (CATEGORIES as string[]).includes(c)
        ? (c as Category)
        : undefined;
    const sub = typeof search.sub === "string" ? search.sub : undefined;
    return { category, sub };
  },
  component: SubmitFeedbackPage,
});

function SubmitFeedbackPage() {
  const { user, isLoggedIn, setPendingCategory, isHydrating } = useAuth();
  const { addFeedback } = useFeedbacks();
  const { category, sub } = Route.useSearch();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [otherComments, setOtherComments] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isHydrating) return null;

  if (!isLoggedIn || !user) {
    if (category) setPendingCategory({ category, sub });
    return <Navigate to="/login" />;
  }

  const resolvedCategory: Category = category ?? "Other";

  const submit = async () => {
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addFeedback({
        category: resolvedCategory,
        subCategory: sub,
        title: title.trim(),
        description: description.trim(),
        otherComments: otherComments.trim() || undefined,
        files,
      });
      navigate({ to: "/success" });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit feedback. Please try again.";
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400">Category</span>
          <span className="rounded-full bg-[#1a936f]/15 px-3 py-1 text-sm font-medium text-[#2dd4bf] ring-1 ring-[#1a936f]/40">
            {resolvedCategory}
          </span>
          {sub && (
            <span className="rounded-full bg-slate-700/60 px-3 py-1 text-sm text-gray-200">
              {sub}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-white">Share your feedback</h1>
        <p className="mt-1 text-sm text-gray-300">
          Give us the details — the more we know, the better we can help.
        </p>

        <div className="mt-8 space-y-6 rounded-3xl border border-slate-700/50 bg-slate-800 p-6 sm:p-8">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-200">
              Title / Subject / Brief Issue
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A short summary of your feedback"
              className="border-slate-700/60 bg-slate-900/60 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-200">
              Describe your issue in detail
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Walk us through what happened, what you expected, and what actually happened."
              rows={7}
              className="border-slate-700/60 bg-slate-900/60 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-200">
              Upload Attachments
            </Label>
            <FileDropzone files={files} onChange={setFiles} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-200">
              Any other comments for us?
            </Label>
            <Textarea
              value={otherComments}
              onChange={(e) => setOtherComments(e.target.value)}
              placeholder="Optional"
              rows={4}
              className="border-slate-700/60 bg-slate-900/60 text-white placeholder:text-gray-500"
            />
          </div>

          {submitError && (
            <p className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/30">
              {submitError}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={submit}
              disabled={!title.trim() || !description.trim() || isSubmitting}
              className="bg-[#1a936f] px-8 py-6 text-base font-semibold text-white hover:bg-[#157a5b] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}
