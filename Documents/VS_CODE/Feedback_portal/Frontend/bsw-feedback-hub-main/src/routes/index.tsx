import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/PageContainer";
import { CategoryGrid } from "@/components/CategoryGrid";
import { useAuth } from "@/lib/auth-context";
import type { Category } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BSW Feedback Portal — Home" },
      {
        name: "description",
        content:
          "Choose a category and share your feedback with BSW. Fast, private, and heard.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { isLoggedIn, setPendingCategory } = useAuth();

  const handleSelect = (category: Category, sub?: string) => {
    if (!isLoggedIn) {
      setPendingCategory({ category, sub });
      navigate({ to: "/login" });
      return;
    }
    navigate({
      to: "/submit-feedback",
      search: { category, sub },
    });
  };

  return (
    <PageContainer>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center sm:mb-16"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-[#1a936f]/40 bg-[#1a936f]/10 px-3 py-1 text-xs font-medium text-[#2dd4bf]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1a936f]" />
          Board of Student Welfare
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          We've got your back
          <span className="block bg-gradient-to-r from-[#1a936f] to-[#2dd4bf] bg-clip-text text-transparent">
            Feedback Portal
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-gray-300 sm:text-lg">
          Tell us what's working, what's broken, and what could be better. Pick a
          category below to get started.
        </p>
      </motion.section>

      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-white">Choose a category</h2>
          <span className="text-sm text-gray-400">7 categories</span>
        </div>
        <CategoryGrid onSelect={handleSelect} />
      </section>
    </PageContainer>
  );
}
