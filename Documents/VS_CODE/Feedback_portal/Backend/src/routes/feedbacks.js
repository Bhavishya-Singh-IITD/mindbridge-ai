"use strict";

const express    = require("express");
const multer     = require("multer");
const rateLimit  = require("express-rate-limit");
const { body, query, param, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const path       = require("path");
const prisma     = require("../lib/prisma");
const { uploadFile, deleteFile, createSignedUrl } = require("../lib/supabase");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// ── FIX 2 — Submission rate limiter ──────────────────────────────────────────
// Prevents a single authenticated user from flooding the database.
// 20 submissions per IP per hour.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Submission limit reached. You may submit up to 20 feedbacks per hour." },
});

// ── FIX 1 — Magic-byte signature table ───────────────────────────────────────
// Each entry maps a MIME type to its expected binary signature inside the file.
// This is checked AFTER multer buffers the upload, using the raw bytes —
// not the client-supplied Content-Type header, which is trivially spoofable.
//
// Note: image/svg+xml is intentionally EXCLUDED. SVG files are XML and can
// embed arbitrary JavaScript, making them a stored-XSS vector when served
// from a public Supabase bucket.
const MAGIC_SIGNATURES = [
  { mime: "image/jpeg",   offset: 0, magic: Buffer.from([0xff, 0xd8, 0xff]) },
  { mime: "image/png",    offset: 0, magic: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
  { mime: "image/gif",    offset: 0, magic: Buffer.from([0x47, 0x49, 0x46, 0x38]) },
  // WEBP: "WEBP" at byte offset 8 (preceded by "RIFF" + 4-byte size)
  { mime: "image/webp",   offset: 8, magic: Buffer.from([0x57, 0x45, 0x42, 0x50]) },
  // PDF: "%PDF"
  { mime: "application/pdf", offset: 0, magic: Buffer.from([0x25, 0x50, 0x44, 0x46]) },
  // DOCX / XLSX / PPTX / ZIP all share the "PK" ZIP magic header
  {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    offset: 0, magic: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
  },
  {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    offset: 0, magic: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
  },
  {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    offset: 0, magic: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
  },
  { mime: "application/zip",         offset: 0, magic: Buffer.from([0x50, 0x4b, 0x03, 0x04]) },
  // Legacy Office (DOC / XLS / PPT) — Compound Document File (OLE2)
  { mime: "application/msword",       offset: 0, magic: Buffer.from([0xd0, 0xcf, 0x11, 0xe0]) },
  { mime: "application/vnd.ms-excel", offset: 0, magic: Buffer.from([0xd0, 0xcf, 0x11, 0xe0]) },
  { mime: "application/vnd.ms-powerpoint", offset: 0, magic: Buffer.from([0xd0, 0xcf, 0x11, 0xe0]) },
  // MP4: "ftyp" at byte offset 4 (ISO Base Media File Format)
  { mime: "video/mp4",  offset: 4, magic: Buffer.from([0x66, 0x74, 0x79, 0x70]) },
  // WebM: EBML header
  { mime: "video/webm", offset: 0, magic: Buffer.from([0x1a, 0x45, 0xdf, 0xa3]) },
  // text/plain and text/csv have no reliable magic bytes — MIME check is the only guard.
];

const ALLOWED_MIMES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
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
 * Returns true if the buffer's leading bytes match the expected magic signature
 * for the claimed MIME type. Returns true for types with no reliable magic bytes
 * (text/plain, text/csv) since they cannot be validated this way.
 */
function validateMagicBytes(buffer, claimedMime) {
  const sigs = MAGIC_SIGNATURES.filter((s) => s.mime === claimedMime);
  if (sigs.length === 0) return true; // No magic-byte rule for this type

  return sigs.some((sig) => {
    const end = sig.offset + sig.magic.length;
    if (buffer.length < end) return false;
    return sig.magic.every((byte, i) => buffer[sig.offset + i] === byte);
  });
}

// ── FIX 1 — Multer with strict limits ────────────────────────────────────────
// Hard-cap the file size at 100 MB regardless of the env variable (prevents
// accidental misconfiguration of MAX_FILE_SIZE_MB to an absurd value).
const MAX_FILE_MB = Math.min(Number(process.env.MAX_FILE_SIZE_MB || 100), 100);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize:  MAX_FILE_MB * 1024 * 1024,
    files:     10,    // max 10 attachments per submission
    fields:    10,    // max 10 non-file form fields
    fieldSize: 8192,  // max 8 KB per text field (prevents huge text DoS)
  },
  fileFilter: (_req, file, cb) => {
    // Step 1 — Reject by Content-Type if not in the allowlist.
    // This is a fast first gate, NOT the final validation.
    // Magic-byte checking (in the route handler) is the authoritative check.
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      return cb(new Error(`File type '${file.mimetype}' is not permitted.`));
    }
    // Step 2 — Sanitise filename: strip path separators and dangerous characters
    // to prevent path traversal attacks (e.g. "../../etc/passwd.pdf").
    file.originalname = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, true);
  },
});

// ── Constants ─────────────────────────────────────────────────────────────────
const VALID_CATEGORIES = [
  "BSW Portals", "BSW Website", "BSW Representatives",
  "Courses", "Hostel", "Institute", "Other",
];

const STATUS_DISPLAY = {
  Pending:     "Pending",
  In_Progress: "In Progress",
  Resolved:    "Resolved",
};
const STATUS_ENUM = {
  "Pending":     "Pending",
  "In Progress": "In_Progress",
  "Resolved":    "Resolved",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function validationGuard(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      error: "Validation failed.",
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
    return true;
  }
  return false;
}

/**
 * Serialize a Prisma Feedback (with attachments) into the frontend shape.
 *
 * FIX 3 — storagePath is intentionally OMITTED from every attachment object.
 * Exposing the raw Supabase storage path lets a client bypass the signed-URL
 * endpoint and construct direct download URLs if the bucket is ever set to
 * public. The signed-URL endpoint (`GET /:feedbackId/attachments/:id/url`)
 * is the ONLY authorised download path.
 */
function serializeFeedback(fb) {
  return {
    id:               fb.id,
    userName:         fb.userName,
    userEmail:        fb.userEmail,
    userRole:         fb.userRole,
    category:         fb.category,
    subCategory:      fb.subCategory  ?? undefined,
    title:            fb.title,
    description:      fb.description,
    otherComments:    fb.otherComments ?? undefined,
    driveLink:        fb.driveLink     ?? undefined,
    status:           STATUS_DISPLAY[fb.status] ?? fb.status,
    progressStartedAt: fb.progressStartedAt?.toISOString() ?? undefined,
    createdAt:        fb.createdAt.toISOString(),
    attachments: (fb.attachments ?? []).map((a) => ({
      id:        a.id,
      name:      a.originalName,
      // storagePath: intentionally excluded
      publicUrl: a.publicUrl ?? undefined,
      type:      a.mimeType,
      size:      a.sizeBytes,
    })),
  };
}

const FEEDBACK_INCLUDE = { attachments: { orderBy: { createdAt: "asc" } } };

// ── POST /api/feedbacks ───────────────────────────────────────────────────────
router.post(
  "/",
  requireAuth,
  submitLimiter,              // FIX 2 — rate-limit before multer to save bandwidth
  upload.array("attachments", 10),
  [
    body("category").isIn(VALID_CATEGORIES)
      .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`),
    body("title").trim().isLength({ min: 1, max: 200 })
      .withMessage("Title must be 1–200 characters."),
    body("description").trim().isLength({ min: 1, max: 5000 })
      .withMessage("Description must be 1–5000 characters."),
    body("subCategory").optional().trim().isLength({ max: 100 }),
    body("otherComments").optional().trim().isLength({ max: 2000 }),
    // FIX 6 — HTTPS-only drive links. isURL() alone accepts http:// and
    // javascript: URIs; specifying protocols: ["https"] closes both.
    body("driveLink")
      .optional({ checkFalsy: true })
      .isURL({ protocols: ["https"], require_protocol: true })
      .withMessage("Drive link must be a valid HTTPS URL."),
  ],
  async (req, res) => {
    if (validationGuard(req, res)) return;

    const { category, subCategory, title, description, otherComments, driveLink } = req.body;
    const { user } = req;
    const feedbackId = uuidv4();
    const userRole   = user.subRole ?? (user.role === "admin" ? "Admin" : "User");

    try {
      // ── FIX 1 — Magic-byte validation ──────────────────────────────────────
      // At this point multer has already buffered each file. We verify the raw
      // bytes match the declared MIME type before touching Supabase Storage.
      const uploadedFiles = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          if (!validateMagicBytes(file.buffer, file.mimetype)) {
            return res.status(422).json({
              error: `File "${file.originalname}" content does not match its declared type "${file.mimetype}". Upload rejected.`,
            });
          }

          const ext         = path.extname(file.originalname).toLowerCase();
          // Storage path uses only server-generated UUIDs — no user input in the path
          const storagePath = `feedbacks/${feedbackId}/${uuidv4()}${ext}`;

          try {
            const { publicUrl } = await uploadFile(storagePath, file.buffer, file.mimetype);
            uploadedFiles.push({
              originalName: file.originalname,
              storagePath,
              publicUrl,
              mimeType:  file.mimetype,
              sizeBytes: file.size,
            });
          } catch (uploadErr) {
            console.error("[storage] Upload failed:", uploadErr.message);
            // Surface failure clearly rather than silently dropping the file
            return res.status(502).json({
              error: `Could not upload "${file.originalname}". Please try again.`,
            });
          }
        }
      }

      // ── Insert feedback + attachments in a single Prisma operation ─────────
      const feedback = await prisma.feedback.create({
        data: {
          id:           feedbackId,
          userId:       user.id,
          userName:     user.name,
          userEmail:    user.email,
          userRole,
          category,
          subCategory:    subCategory?.trim()   || null,
          title:          title.trim(),
          description:    description.trim(),
          otherComments:  otherComments?.trim() || null,
          driveLink:      driveLink?.trim()     || null,
          attachments: { create: uploadedFiles },
        },
        include: FEEDBACK_INCLUDE,
      });

      res.status(201).json({ feedback: serializeFeedback(feedback) });
    } catch (err) {
      console.error("[feedbacks/create]", err);
      res.status(500).json({ error: "Failed to submit feedback." });
    }
  }
);

// ── GET /api/feedbacks/mine ───────────────────────────────────────────────────
// No :id param — always scoped to the authenticated user's own email.
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { userEmail: { equals: req.user.email, mode: "insensitive" } },
      include: FEEDBACK_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    res.json({ feedbacks: feedbacks.map(serializeFeedback) });
  } catch (err) {
    console.error("[feedbacks/mine]", err);
    res.status(500).json({ error: "Failed to fetch your feedbacks." });
  }
});

// ── GET /api/feedbacks — Admin only ──────────────────────────────────────────
router.get(
  "/",
  requireAuth,
  requireAdmin,
  [
    query("category").optional().isIn(VALID_CATEGORIES).withMessage("Invalid category."),
    query("status").optional()
      .isIn(["Pending", "In Progress", "Resolved"]).withMessage("Invalid status."),
  ],
  async (req, res) => {
    if (validationGuard(req, res)) return;

    const where = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.status)   where.status   = STATUS_ENUM[req.query.status];

    try {
      const feedbacks = await prisma.feedback.findMany({
        where,
        include: FEEDBACK_INCLUDE,
        orderBy: { createdAt: "desc" },
      });
      res.json({ feedbacks: feedbacks.map(serializeFeedback) });
    } catch (err) {
      console.error("[feedbacks/list]", err);
      res.status(500).json({ error: "Failed to fetch feedbacks." });
    }
  }
);

// ── GET /api/feedbacks/:id ────────────────────────────────────────────────────
router.get(
  "/:id",
  requireAuth,
  // FIX 5 — UUID validation: prevents Prisma P2023 ("malformed UUID") errors
  // from leaking schema details when a crafted non-UUID string is sent.
  [param("id").isUUID(4).withMessage("Invalid feedback ID.")],
  async (req, res) => {
    if (validationGuard(req, res)) return;

    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id: req.params.id },
        include: FEEDBACK_INCLUDE,
      });

      if (!feedback) return res.status(404).json({ error: "Feedback not found." });

      // FIX 4 — IDOR: return 404 (not 403) when a non-owner accesses someone
      // else's feedback ID. A 403 confirms the resource exists, enabling
      // enumeration of other users' feedback IDs.
      if (
        req.user.role !== "admin" &&
        feedback.userEmail.toLowerCase() !== req.user.email.toLowerCase()
      ) {
        return res.status(404).json({ error: "Feedback not found." });
      }

      res.json({ feedback: serializeFeedback(feedback) });
    } catch (err) {
      console.error("[feedbacks/get]", err);
      res.status(500).json({ error: "Failed to fetch feedback." });
    }
  }
);

// ── PATCH /api/feedbacks/:id/status — Admin only ─────────────────────────────
router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  [
    // FIX 5 — UUID validation on the :id param
    param("id").isUUID(4).withMessage("Invalid feedback ID."),
    body("status")
      .isIn(["Pending", "In Progress", "Resolved"])
      .withMessage("Status must be one of: Pending, In Progress, Resolved"),
  ],
  async (req, res) => {
    if (validationGuard(req, res)) return;

    try {
      const current = await prisma.feedback.findUnique({
        where: { id: req.params.id },
        select: { id: true, status: true, progressStartedAt: true },
      });

      if (!current) return res.status(404).json({ error: "Feedback not found." });

      const newStatusEnum = STATUS_ENUM[req.body.status];
      const isProgressTransition =
        current.status === "Pending" && newStatusEnum === "In_Progress";

      const updated = await prisma.feedback.update({
        where: { id: current.id },
        data: {
          status: newStatusEnum,
          progressStartedAt: isProgressTransition ? new Date() : current.progressStartedAt,
        },
        include: FEEDBACK_INCLUDE,
      });

      res.json({ feedback: serializeFeedback(updated) });
    } catch (err) {
      console.error("[feedbacks/status]", err);
      res.status(500).json({ error: "Failed to update status." });
    }
  }
);

// ── GET /api/feedbacks/:feedbackId/attachments/:attachmentId/url ──────────────
// Returns a short-lived signed URL (5 min). storagePath is never sent to client.
router.get(
  "/:feedbackId/attachments/:attachmentId/url",
  requireAuth,
  [
    // FIX 5 — UUID validation on both path params
    param("feedbackId").isUUID(4).withMessage("Invalid feedback ID."),
    param("attachmentId").isUUID(4).withMessage("Invalid attachment ID."),
  ],
  async (req, res) => {
    if (validationGuard(req, res)) return;

    try {
      const attachment = await prisma.attachment.findFirst({
        where: {
          id:         req.params.attachmentId,
          feedbackId: req.params.feedbackId,
        },
        include: { feedback: { select: { userEmail: true } } },
      });

      if (!attachment) return res.status(404).json({ error: "Attachment not found." });

      // FIX 4 — IDOR: return 404 (not 403) to avoid confirming the attachment
      // exists to a caller who does not own it.
      if (
        req.user.role !== "admin" &&
        attachment.feedback.userEmail.toLowerCase() !== req.user.email.toLowerCase()
      ) {
        return res.status(404).json({ error: "Attachment not found." });
      }

      const signedUrl = await createSignedUrl(attachment.storagePath, 300); // 5 min TTL
      res.json({ url: signedUrl });
    } catch (err) {
      console.error("[attachments/url]", err);
      res.status(500).json({ error: "Failed to generate download URL." });
    }
  }
);

// ── DELETE /api/feedbacks/:id — Admin only ────────────────────────────────────
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  // FIX 5 — UUID validation on the :id param
  [param("id").isUUID(4).withMessage("Invalid feedback ID.")],
  async (req, res) => {
    if (validationGuard(req, res)) return;

    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id: req.params.id },
        include: { attachments: true },
      });

      if (!feedback) return res.status(404).json({ error: "Feedback not found." });

      // Best-effort storage cleanup — errors are logged but don't abort the delete
      for (const att of feedback.attachments) {
        await deleteFile(att.storagePath);
      }

      await prisma.feedback.delete({ where: { id: req.params.id } });
      res.json({ message: "Feedback deleted successfully." });
    } catch (err) {
      console.error("[feedbacks/delete]", err);
      res.status(500).json({ error: "Failed to delete feedback." });
    }
  }
);

module.exports = router;
