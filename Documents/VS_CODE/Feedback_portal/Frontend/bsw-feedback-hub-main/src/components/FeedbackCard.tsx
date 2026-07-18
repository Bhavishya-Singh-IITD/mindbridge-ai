import { motion } from "framer-motion";
import { ExternalLink, Mail, User } from "lucide-react";
import DOMPurify from "dompurify";
import { AttachmentsDropdown } from "./AttachmentsDropdown";
import { useFeedbacks } from "@/lib/feedback-store";
import type { Feedback } from "@/lib/mock-data";

// ── URL sanitisation ──────────────────────────────────────────────────────────

/**
 * Validates that a URL uses only https: protocol before it can be placed in
 * an anchor's href attribute.
 *
 * Attack vector blocked: stored-XSS via `javascript:alert(1)` or
 * `data:text/html,<script>...` payloads submitted in the driveLink field.
 * Even though the backend validates driveLink with `isURL({ protocols: ["https"] })`,
 * we apply defence-in-depth on the frontend: if a payload somehow reaches
 * the client (e.g., data migration, direct DB edit), it is neutralised here
 * before reaching the DOM.
 *
 * We use the WHATWG URL parser (not a regex) because regex-based protocol
 * checks are bypassed by whitespace (`  javascript:`) or Unicode encoding.
 * DOMPurify strips any HTML/encoding tricks from the raw string first.
 *
 * Returns the normalized URL string, or null if it fails validation.
 * Callers must treat null as "do not render an anchor".
 */
function sanitizeLink(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;

  // Strip any HTML markup or encoded characters from the raw string.
  // ALLOWED_TAGS: [] → output is a plain string with no tags.
  const cleaned = DOMPurify.sanitize(raw.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  try {
    const parsed = new URL(cleaned);
    // Only https: is allowed for user-submitted external links.
    // http: is intentionally excluded — no plaintext links to external resources.
    if (parsed.protocol !== "https:") return null;
    return parsed.href; // WHATWG-normalised form
  } catch {
    return null; // malformed URL
  }
}

// ── Safe external link component ──────────────────────────────────────────────

/**
 * Renders a validated external link or nothing if the URL fails sanitisation.
 *
 * Security properties:
 *  - href is always the output of sanitizeLink() — never a raw user string
 *  - rel="noopener noreferrer" prevents tab-napping via window.opener
 *  - target="_blank" opens in a new tab (standard UX for external links)
 *  - Link text is a React text node (JSX interpolation) — never innerHTML
 */
function SafeExternalLink({ href, children }: { href: string | undefined; children: React.ReactNode }) {
  const safeHref = sanitizeLink(href);
  if (!safeHref) return null;

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-xs font-medium text-[#2dd4bf] transition-colors hover:border-[#1a936f]/60 hover:bg-[#1a936f]/10 hover:text-white"
    >
      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
      {children}
    </a>
  );
}

// ── Date formatters ───────────────────────────────────────────────────────────

function fmt(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `Submitted at ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} at ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtProgress(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} at ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── FeedbackCard ──────────────────────────────────────────────────────────────

export function FeedbackCard({
  feedback,
  variant = "user",
}: {
  feedback: Feedback;
  variant?: "user" | "admin";
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800 p-6 shadow-sm transition-colors hover:border-[#1a936f]/50"
    >
      {/* ── Admin-only user identity strip ── */}
      {variant === "admin" && (
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-slate-900/60 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-gray-200">
            <User className="h-4 w-4 text-[#2dd4bf]" />
            {/*
             * XSS note — SAFE: React JSX interpolates these as text nodes,
             * not innerHTML. No HTML is parsed. userName/userEmail are plain
             * strings from the mock store or the backend's JSON.stringify.
             * If this component ever switches to dangerouslySetInnerHTML,
             * DOMPurify must be applied at that point.
             */}
            <span className="font-medium text-white">{feedback.userName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="truncate">{feedback.userEmail}</span>
          </div>
          <span className="rounded-full border border-slate-700/60 px-2.5 py-0.5 text-xs text-gray-300">
            {feedback.userRole}
          </span>
        </div>
      )}

      {/* ── Header row: category badges + attachments trigger ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#1a936f]/15 px-2.5 py-0.5 text-xs font-medium text-[#2dd4bf] ring-1 ring-[#1a936f]/40">
              {feedback.category}
            </span>
            {feedback.subCategory && (
              <span className="rounded-full bg-slate-700/60 px-2.5 py-0.5 text-xs text-gray-200">
                {feedback.subCategory}
              </span>
            )}
          </div>
          {/* SAFE: text node interpolation */}
          <h3 className="text-lg font-semibold text-white">{feedback.title}</h3>
          <p className="mt-1 text-xs text-gray-400">{fmt(feedback.createdAt)}</p>
        </div>
        <AttachmentsDropdown attachments={feedback.attachments} />
      </div>

      {/* ── Description ── */}
      {/*
       * XSS note — SAFE: React renders this as a text node.
       * If rich-text/Markdown rendering is added in future, apply:
       *   DOMPurify.sanitize(markdownToHtml(feedback.description), {
       *     ALLOWED_TAGS: ["p","strong","em","ul","ol","li","a","br"],
       *     ALLOWED_ATTR: { "a": ["href","rel","target"] },
       *   })
       * and pass the result via dangerouslySetInnerHTML.
       * Do NOT use dangerouslySetInnerHTML without DOMPurify.
       */}
      <p className="mt-4 text-sm leading-relaxed text-gray-300">{feedback.description}</p>

      {/* ── Other comments ── */}
      {feedback.otherComments && (
        <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-900/40 p-3 text-sm text-gray-300">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            Other comments
          </div>
          {/* SAFE: text node interpolation */}
          {feedback.otherComments}
        </div>
      )}

      {/* ── Drive link — sanitised before rendering ── */}
      {/*
       * XSS note — UNSAFE WITHOUT GUARD: placing feedback.driveLink directly
       * in href would allow javascript: / data: URI execution on click.
       * SafeExternalLink calls sanitizeLink() which validates protocol via
       * the WHATWG URL parser, blocking all non-https: schemes.
       * If sanitizeLink() returns null, SafeExternalLink renders nothing.
       */}
      {feedback.driveLink && (
        <div className="mt-3">
          <SafeExternalLink href={feedback.driveLink}>
            View Drive link
          </SafeExternalLink>
        </div>
      )}

      {/* ── Status section ── */}
      <StatusSection feedback={feedback} variant={variant} />
    </motion.article>
  );
}

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40",
  "In Progress": "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/40",
  Resolved: "bg-[#1a936f]/15 text-[#2dd4bf] ring-1 ring-[#1a936f]/40",
};

function StatusSection({
  feedback,
  variant,
}: {
  feedback: Feedback;
  variant: "user" | "admin";
}) {
  const { updateStatus } = useFeedbacks();
  const status = feedback.status ?? "Pending";

  /**
   * Handles status change from the admin dropdown.
   *
   * The store's updateStatus() will throw UnauthorizedError if the caller's
   * role is not "admin" (read from AuthContext — unforgeable by this handler).
   * We catch that error here so it doesn't propagate to the root error boundary
   * and flash a full-page error screen on a UI interaction.
   *
   * The UI-level guard `variant === "admin"` is a first line of defence;
   * the store guard is the authoritative enforcement point.
   */
  const handleStatusChange = (newStatus: string) => {
    try {
      updateStatus(feedback.id, newStatus as Feedback["status"]);
    } catch (err) {
      // Log the violation for developer/audit visibility.
      // In production, console.error is safe — it writes to the browser console
      // only, not to the DOM, so no information is leaked to the UI user.
      console.error("[StatusSection] updateStatus rejected:", err);
      // Do not re-throw — let the UI remain stable.
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {/* Status pill — visible to everyone */}
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES["Pending"]}`}
      >
        {status}
      </span>

      {/* "Work started" timestamp — visible to everyone once set */}
      {feedback.progressStartedAt && (
        <span className="text-xs text-gray-400">
          Work started: {fmtProgress(feedback.progressStartedAt)}
        </span>
      )}

      {/* Admin-only: dropdown to change status (UI-layer guard) */}
      {variant === "admin" && (
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="ml-auto rounded-lg border border-slate-700/60 bg-slate-900/60 px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#1a936f]/60"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      )}
    </div>
  );
}

