"use strict";

/**
 * src/lib/supabase.js
 *
 * Supabase admin client — uses the SERVICE ROLE key so the server can
 * upload/delete files from private buckets without a per-user JWT.
 *
 * Design decision: LAZY initialisation.
 * The Supabase SDK validates SUPABASE_URL at construction time and throws
 * synchronously if the value is malformed (e.g. the placeholder string
 * "https://<your-project-ref>.supabase.co"). Calling createClient() at
 * module-load time therefore crashes the entire process before Express,
 * Helmet, or any middleware can run.
 *
 * Instead, _supabase is created on the FIRST call to getClient(), which
 * happens only when a route handler actually needs storage. By that point:
 *   - index.js has already validated the env vars exist (startup guard).
 *   - prisma.$connect() has already succeeded (DB is reachable).
 * Any error here is caught per-request and returns a clean 502, not a crash.
 *
 * Required environment variables:
 *   SUPABASE_URL              → https://<project-ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY → eyJ... (Settings → API → service_role)
 *   SUPABASE_STORAGE_BUCKET   → bucket name (default: "feedback-attachments")
 */

const { createClient } = require("@supabase/supabase-js");

/** Name of the Supabase Storage bucket for attachments. */
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "feedback-attachments";

// ── Lazy singleton ─────────────────────────────────────────────────────────────
let _client = null;

/**
 * Returns the initialised Supabase admin client.
 * Validates the URL format before first construction so the error message
 * is actionable ("URL is malformed") rather than the SDK's generic throw.
 *
 * @throws {Error} If SUPABASE_URL is not a valid HTTPS URL.
 */
function getClient() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // ── Validate URL format before handing to the SDK ──────────────────────────
  // `new URL()` throws a TypeError for malformed strings (e.g. placeholders).
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      `[supabase] SUPABASE_URL is not a valid URL: "${url}". ` +
      "Please set the correct project URL from Supabase Dashboard → Settings → API."
    );
  }

  if (parsed.protocol !== "https:") {
    throw new Error(
      `[supabase] SUPABASE_URL must use HTTPS. Got protocol: "${parsed.protocol}". ` +
      "Supabase project URLs always start with https://"
    );
  }

  if (!key || key.length < 20 || key === "eyJ...") {
    throw new Error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY appears to be missing or is still a placeholder. " +
      "Copy the service_role key from Supabase Dashboard → Settings → API."
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _client;
}

// ── Storage helpers ───────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Supabase Storage.
 *
 * @param {string} storagePath  Path within the bucket — must be pre-sanitised.
 * @param {Buffer} buffer       File contents.
 * @param {string} mimeType     MIME type (already validated by magic-byte check).
 * @returns {{ publicUrl: string, storagePath: string }}
 * @throws {Error} On SDK construction failure or upload error.
 */
async function uploadFile(storagePath, buffer, mimeType) {
  const client = getClient(); // throws with actionable message if misconfigured

  const { error } = await client.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false, // never silently overwrite an existing path
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  // getPublicUrl is synchronous and never throws — safe to call directly.
  const { data } = client.storage.from(BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

/**
 * Delete a file from Supabase Storage (best-effort; logs but does not throw).
 *
 * @param {string} storagePath  Path within the bucket.
 */
async function deleteFile(storagePath) {
  try {
    const client = getClient();
    const { error } = await client.storage.from(BUCKET).remove([storagePath]);
    if (error) {
      console.error(`[supabase] Failed to delete "${storagePath}":`, error.message);
    }
  } catch (err) {
    // Supabase is misconfigured — log and continue; don't crash a delete route
    console.error("[supabase] deleteFile failed:", err.message);
  }
}

/**
 * Create a short-lived signed URL for a private bucket object.
 *
 * @param {string} storagePath       Path within the bucket.
 * @param {number} expiresInSeconds  TTL (default 300 s = 5 minutes).
 * @returns {Promise<string>} The signed URL.
 * @throws {Error} On SDK construction failure or signing error.
 */
async function createSignedUrl(storagePath, expiresInSeconds = 300) {
  const client = getClient();

  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) throw new Error(`Failed to create signed URL: ${error.message}`);
  return data.signedUrl;
}

module.exports = { BUCKET, uploadFile, deleteFile, createSignedUrl };
