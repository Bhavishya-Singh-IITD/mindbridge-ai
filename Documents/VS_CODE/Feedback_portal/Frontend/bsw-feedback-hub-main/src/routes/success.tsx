import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [{ title: "Thank you — BSW Feedback Portal" }],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { isLoggedIn, isHydrating } = useAuth();
  const navigate = useNavigate();

  // ── Auth + hydration guard ─────────────────────────────────────────────────
  // Wait for the token-verification fetch to complete before deciding whether
  // to redirect — prevents false redirects on hard refresh (same pattern as
  // all other protected routes in this app).
  if (isHydrating) return null;

  // Redirect unauthenticated visitors to the home page (not /login) because:
  //  - They are not trying to access privileged data; they simply typed the URL.
  //  - Showing the "Thank you" screen to someone who submitted nothing is
  //    misleading and a minor information-disclosure (implies the portal
  //    accepted a submission that never happened).
  //  - /login is reserved for deliberate authentication intent, not corrective
  //    redirects from dead-end pages.
  if (!isLoggedIn) return <Navigate to="/" />;

  return (
    <PageContainer className="max-w-xl">
      <div className="flex flex-col items-center rounded-3xl border border-slate-700/50 bg-slate-800 px-6 py-14 text-center shadow-xl sm:px-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.05 }}
          className="relative"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.3, 1.6], opacity: [0.4, 0.15, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-[#1a936f]/40"
          />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#1a936f]/20 ring-4 ring-[#1a936f]/40">
            <CheckCircle2 className="h-14 w-14 text-[#2dd4bf]" strokeWidth={2.2} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-2xl font-bold text-white sm:text-3xl"
        >
          Thank you for your valuable feedback
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 max-w-md text-sm text-gray-300 sm:text-base"
        >
          It has been submitted successfully. Our team will review it and follow up
          if needed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Button
            onClick={() => navigate({ to: "/my-feedbacks" })}
            className="bg-[#1a936f] px-6 py-6 text-base font-semibold text-white hover:bg-[#157a5b]"
          >
            View your submitted feedbacks
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="border-slate-700/60 bg-transparent px-6 py-6 text-base text-white hover:bg-slate-700/40"
          >
            Back to home
          </Button>
        </motion.div>
      </div>
    </PageContainer>
  );
}
