import { ChevronDown, Download, Paperclip } from "lucide-react";
import DOMPurify from "dompurify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Attachment } from "@/lib/mock-data";

// ── URL safety ────────────────────────────────────────────────────────────────

/**
 * Validates that a URL uses only http: or https: protocol.
 *
 * Why: Browsers allow href values like `javascript:alert(1)` or
 * `data:text/html,<script>...` which execute arbitrary code when an anchor
 * is clicked. We use the WHATWG URL parser (not a regex) to extract the
 * protocol reliably — regex-based checks are easily bypassed with whitespace
 * or encoding tricks (`  javascript:`, `java\nscript:`).
 *
 * Returns the validated URL string, or null if the URL is unsafe/malformed.
 */
function sanitizeUrl(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;

  // DOMPurify strips any markup or encoded protocol tricks from the string
  // before we even attempt to parse it as a URL.
  const cleaned = DOMPurify.sanitize(raw.trim(), {
    ALLOWED_TAGS: [],   // strip all HTML — we want a plain string only
    ALLOWED_ATTR: [],
  });

  try {
    const parsed = new URL(cleaned);
    // Strict protocol allowlist — only plain HTTP/HTTPS
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href; // return the WHATWG-normalized form
  } catch {
    // URL constructor throws on malformed input
    return null;
  }
}

// ── Download handler ──────────────────────────────────────────────────────────

/**
 * Safely initiates a file download.
 *
 * When a real backend URL is present (attachment.publicUrl), we validate it
 * through sanitizeUrl() before assigning it to an anchor's href. This prevents
 * stored-XSS payloads (e.g. `javascript:` or `data:text/html`) embedded in
 * URLs returned from the API from executing in the user's browser.
 *
 * While still using mock data (no publicUrl), we build a safe Blob URL
 * from a hardcoded template string — no user-supplied content reaches the
 * Blob body or the anchor href.
 *
 * The `download` attribute receives the sanitized attachment name (a text
 * node assignment, not innerHTML) so there is no second injection point.
 */
function handleDownload(attachment: Attachment): void {
  const safeName = attachment.name; // rendered as text, not as HTML

  if (attachment.publicUrl) {
    // ── Real backend URL path ──────────────────────────────────────────────
    const safeUrl = sanitizeUrl(attachment.publicUrl);
    if (!safeUrl) {
      console.warn("[AttachmentsDropdown] Unsafe URL blocked for:", safeName);
      return; // silently abort — do not navigate
    }
    const a = document.createElement("a");
    a.href = safeUrl;         // validated: only http: or https:
    a.download = safeName;    // text attribute, not innerHTML
    a.rel = "noopener noreferrer"; // prevents tab-napping via window.opener
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  // ── Mock / dev path — Blob from a hardcoded template ─────────────────────
  // No user-supplied content reaches the Blob body.
  const blob = new Blob(
    ["[Development placeholder] This file is not yet connected to a real backend."],
    { type: "text/plain" }
  );
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;      // safe: blob: URL created by us
  a.download = safeName; // text attribute, not innerHTML
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 500);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AttachmentsDropdown({ attachments }: { attachments: Attachment[] }) {
  if (!attachments.length) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs text-gray-500">
        <Paperclip className="h-3.5 w-3.5" />
        No files
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-[#1a936f]/60 hover:bg-[#1a936f]/10 hover:text-white">
          <Paperclip className="h-3.5 w-3.5" />
          Attachments
          <span className="rounded-md bg-[#1a936f]/20 px-1.5 py-0.5 text-[10px] text-[#2dd4bf]">
            {attachments.length}
          </span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 border-slate-700/60 bg-slate-800 text-white">
        <DropdownMenuLabel className="text-xs text-gray-300">Files</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700/60" />
        {attachments.map((a, i) => (
          <DropdownMenuItem
            key={a.id ?? `${a.name}-${i}`}
            onClick={() => handleDownload(a)}
            className="cursor-pointer gap-2 focus:bg-slate-700/60 focus:text-white"
          >
            <Download className="h-4 w-4 text-[#2dd4bf]" />
            {/* Rendered as a text node — safe even with crafted filenames */}
            <span className="truncate text-sm">{a.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
