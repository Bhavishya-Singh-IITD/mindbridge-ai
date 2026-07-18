import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Globe,
  GraduationCap,
  Hotel,
  LayoutGrid,
  MessageCircle,
  MoreHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { BSW_SERVICES_SUB, CATEGORIES, type Category } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICONS: Record<Category, LucideIcon> = {
  "BSW Portals": LayoutGrid,
  "BSW Website": Globe,
  "BSW Representatives": Users,
  Courses: GraduationCap,
  Hostel: Hotel,
  "Institute": MessageCircle,
  Other: MoreHorizontal,
};

const DESCRIPTIONS: Record<Category, string> = {
  "BSW Portals": "Academic, Mental Health, Career and Language portals",
  "BSW Website": "Bugs, broken links, content on the BSW website",
  "BSW Representatives": "Feedback about BSW representatives",
  Courses: "Course structure, grading, instructor feedback",
  Hostel: "Hostel amenities, mess, wardens",
  "Institute": "Fees, admin, institute-wide concerns",
  Other: "Anything else you'd like us to know",
};

export function CategoryGrid({
  onSelect,
}: {
  onSelect: (category: Category, sub?: string) => void;
}) {
  const [expanded, setExpanded] = useState<Category | null>(null);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {CATEGORIES.map((cat) => {
        const Icon = ICONS[cat];
        const hasSub = cat === "BSW Portals";
        const isExpanded = expanded === cat;

        return (
          <motion.div
            key={cat}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800 p-6 shadow-sm transition-colors hover:border-[#1a936f]/60 hover:shadow-lg",
              isExpanded && "border-[#1a936f]/70"
            )}
          >
            <button
              type="button"
              onClick={() => {
                if (hasSub) {
                  setExpanded((prev) => (prev === cat ? null : cat));
                } else {
                  onSelect(cat);
                }
              }}
              className="flex w-full items-start justify-between gap-4 text-left"
            >
              <div className="flex-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a936f]/15 text-[#2dd4bf] ring-1 ring-[#1a936f]/30">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{cat}</h3>
                <p className="mt-1 text-sm text-gray-300">{DESCRIPTIONS[cat]}</p>
              </div>
              {hasSub && (
                <ChevronDown
                  className={cn(
                    "mt-1 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform",
                    isExpanded && "rotate-180 text-[#2dd4bf]"
                  )}
                />
              )}
            </button>

            <AnimatePresence initial={false}>
              {hasSub && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 grid gap-2 border-t border-slate-700/60 pt-4">
                    {BSW_SERVICES_SUB.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(cat, sub);
                        }}
                        className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2.5 text-sm text-gray-200 transition-colors hover:bg-[#1a936f]/20 hover:text-white"
                      >
                        <span>{sub}</span>
                        <ChevronDown className="h-4 w-4 -rotate-90 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
