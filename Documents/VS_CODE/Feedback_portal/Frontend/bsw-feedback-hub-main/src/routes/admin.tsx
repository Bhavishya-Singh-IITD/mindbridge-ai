import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardList, MessageSquarePlus } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — BSW Feedback Portal" }],
  }),
  component: AdminChoicePage,
});

function AdminChoicePage() {
  const { user, isHydrating } = useAuth();
  const navigate = useNavigate();

  // Wait for the token-verification fetch to complete before deciding
  // whether to redirect — prevents false logout flashes on hard refresh.
  if (isHydrating) return null;

  if (!user || user.role !== "admin") return <Navigate to="/login" />;

  const options = [
    {
      title: "Submit my feedback",
      description: "Act as a regular user and file a feedback of your own.",
      icon: MessageSquarePlus,
      onClick: () => navigate({ to: "/" }),
    },
    {
      title: "Check all feedbacks",
      description: "Review feedbacks across every category and user.",
      icon: ClipboardList,
      onClick: () => navigate({ to: "/admin/all-feedbacks" }),
    },
  ];

  return (
    <PageContainer>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Welcome, {user.name}
        </h1>
        <p className="mt-2 text-sm text-gray-300 sm:text-base">
          What would you like to do today?
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {options.map((opt) => (
          <motion.button
            key={opt.title}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={opt.onClick}
            className="group flex flex-col items-start rounded-3xl border border-slate-700/50 bg-slate-800 p-8 text-left transition-colors hover:border-[#1a936f]/60 hover:shadow-xl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a936f]/15 text-[#2dd4bf] ring-1 ring-[#1a936f]/30">
              <opt.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">{opt.title}</h2>
            <p className="mt-2 text-sm text-gray-300">{opt.description}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#2dd4bf]">
              Continue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </PageContainer>
  );
}
