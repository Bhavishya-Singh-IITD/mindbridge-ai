import { AlertCircle, FileText, Upload, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";

// ── Validation constants — must mirror the backend multer config exactly ──────

/** Maximum bytes per file: 100 MB — matches multer fileSize limit */
const MAX_FILE_BYTES = 100 * 1024 * 1024;

/** Maximum number of files per submission — matches multer `files: 10` */
const MAX_FILE_COUNT = 10;

/**
 * Allowed MIME types — exact mirror of the backend ALLOWED_MIMES Set.
 * Note: image/svg+xml is intentionally absent (stored-XSS vector).
 * text/plain and text/csv are included to match the backend allowlist.
 */
const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "video/mp4",
  "video/webm",
]);

/**
 * The HTML `accept` attribute value — drives the file-picker UI hint.
 * This is NOT a security control (drag-and-drop and DevTools bypass it).
 * The real gate is the ALLOWED_MIMES check in validateFiles().
 */
const ACCEPT_ATTR = [
  ".pdf",
  ".doc", ".docx",
  ".xls", ".xlsx",
  ".ppt", ".pptx",
  ".png", ".jpg", ".jpeg", ".gif", ".webp",
  ".txt", ".csv",
  ".zip",
  ".mp4", ".webm",
].join(",");

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Human-readable file size: shows KB below 1 MB, MB above. */
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Validation ────────────────────────────────────────────────────────────────

interface ValidationResult {
  accepted: File[];
  /** Each rejected entry contains the File and a human-readable reason. */
  rejected: { file: File; reason: string }[];
  /** Set when the total accepted count would breach MAX_FILE_COUNT. */
  countError: string | null;
}

/**
 * Validates an incoming batch of dropped/chosen files against:
 *  1. MIME-type allowlist (guards against executables, scripts, SVGs)
 *  2. Per-file size cap (100 MB)
 *  3. Total file count cap (10) — checked after per-file validation
 *
 * @param incoming  New files chosen by the user.
 * @param existing  Files already in the queue (for count calculations).
 */
function validateFiles(incoming: File[], existing: File[]): ValidationResult {
  const accepted: File[] = [];
  const rejected: { file: File; reason: string }[] = [];

  for (const file of incoming) {
    // ── Check 1: MIME type ────────────────────────────────────────────────
    // file.type is set by the browser from the OS content-type detection.
    // For drag-and-drop it is more reliable than the extension alone, but it
    // is still user-controlled — the backend performs magic-byte verification.
    if (!ALLOWED_MIMES.has(file.type)) {
      rejected.push({
        file,
        reason: `File type "${file.type || "unknown"}" is not permitted. Allowed: PDF, Word, Excel, PPT, images, plain text, CSV, ZIP, MP4, WebM.`,
      });
      continue;
    }

    // ── Check 2: File size ────────────────────────────────────────────────
    if (file.size > MAX_FILE_BYTES) {
      rejected.push({
        file,
        reason: `File exceeds the 100 MB limit (${formatSize(file.size)}).`,
      });
      continue;
    }

    accepted.push(file);
  }

  // ── Check 3: Total count cap ──────────────────────────────────────────────
  // Applied after per-file validation so the user sees type/size errors first.
  const available = MAX_FILE_COUNT - existing.length;
  let countError: string | null = null;

  if (accepted.length > available) {
    const overflow = accepted.splice(available); // keep only what fits
    // Move overflow into rejected with a specific message
    for (const f of overflow) {
      rejected.push({
        file: f,
        reason: `Exceeds the ${MAX_FILE_COUNT}-file limit. Remove a file before adding more.`,
      });
    }
    if (overflow.length > 0) {
      countError = `Only ${available} more file${available === 1 ? "" : "s"} can be added (maximum ${MAX_FILE_COUNT} total).`;
    }
  }

  return { accepted, rejected, countError };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FileDropzone({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [rejections, setRejections] = useState<{ file: File; reason: string }[]>([]);
  const [countError, setCountError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Core add handler — all entry points funnel through here ──────────────
  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;

    const incoming = Array.from(list);
    const { accepted, rejected, countError: ce } = validateFiles(incoming, files);

    // Replace (not append) the rejections list so stale errors don't linger
    setRejections(rejected);
    setCountError(ce);

    if (accepted.length > 0) {
      onChange([...files, ...accepted]);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    // Clear count error when user removes a file — they might now be under limit
    if (countError) setCountError(null);
  };

  const dismissRejection = (index: number) => {
    setRejections((prev) => prev.filter((_, i) => i !== index));
  };

  const atLimit = files.length >= MAX_FILE_COUNT;

  return (
    <div className="space-y-3">
      {/* ── Drop zone ── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!atLimit) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => {
          if (!atLimit) inputRef.current?.click();
        }}
        role="button"
        aria-label={
          atLimit
            ? `File upload area — limit of ${MAX_FILE_COUNT} files reached`
            : "File upload area — click or drag files here"
        }
        aria-disabled={atLimit}
        tabIndex={atLimit ? -1 : 0}
        onKeyDown={(e) => {
          if (!atLimit && (e.key === "Enter" || e.key === " ")) {
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-900/40 px-6 py-10 text-center transition-colors",
          !atLimit && "hover:border-[#1a936f]/60 hover:bg-[#1a936f]/5",
          dragging && "border-[#1a936f] bg-[#1a936f]/10",
          atLimit && "cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a936f]/15 text-[#2dd4bf]">
          <Upload className="h-5 w-5" />
        </div>

        <div className="mt-3 text-sm font-medium text-white">
          {atLimit
            ? `Maximum of ${MAX_FILE_COUNT} files reached`
            : "Click to upload or drag files here"}
        </div>

        <div className="mt-1 text-xs text-gray-400">
          PDF, Word, Excel, PPT, images, CSV, ZIP, MP4, WebM
          &nbsp;·&nbsp;max 100 MB per file&nbsp;·&nbsp;up to {MAX_FILE_COUNT} files
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          disabled={atLimit}
          aria-hidden="true"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            // Reset the input so the same file can be re-added after removal
            e.target.value = "";
          }}
        />
      </div>

      {/* ── Count error banner ── */}
      {countError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{countError}</span>
        </div>
      )}

      {/* ── Per-file rejection errors ── */}
      {rejections.length > 0 && (
        <ul
          role="alert"
          aria-live="polite"
          aria-label="File upload errors"
          className="space-y-2"
        >
          {rejections.map(({ file, reason }, i) => (
            <li
              key={`reject-${file.name}-${i}`}
              className="flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                <div className="min-w-0">
                  {/* Rendered as text node — safe even with crafted filenames */}
                  <p className="truncate text-sm font-medium text-red-300">{file.name}</p>
                  <p className="mt-0.5 text-xs text-red-400">{reason}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismissRejection(i)}
                aria-label={`Dismiss error for ${file.name}`}
                className="mt-0.5 flex-shrink-0 rounded-md p-0.5 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ── Accepted files list ── */}
      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Files to upload">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-900/60 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 flex-shrink-0 text-[#2dd4bf]" />
                {/* Safe text rendering — no innerHTML */}
                <span className="truncate text-sm text-gray-200">{f.name}</span>
                <span className="flex-shrink-0 text-xs text-gray-500">
                  {formatSize(f.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                aria-label={`Remove ${f.name}`}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-slate-700/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ── File counter pill ── */}
      {files.length > 0 && (
        <p className="text-right text-xs text-gray-500" aria-live="polite">
          {files.length} / {MAX_FILE_COUNT} file{files.length === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
