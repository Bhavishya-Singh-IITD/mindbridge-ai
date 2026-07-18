"use strict";

require("dotenv").config();

// ── Startup environment guard ─────────────────────────────────────────────────
// Fail fast before any middleware loads — avoids a partially-started server.
const REQUIRED_ENV = [
  "JWT_SECRET",
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const missingVars = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingVars.length) {
  console.error(`[fatal] Missing required environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error("[fatal] JWT_SECRET must be at least 32 characters. Please generate a strong secret.");
  process.exit(1);
}

const express    = require("express");
const helmet     = require("helmet");
const cors       = require("cors");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");
const xssClean   = require("xss-clean");

const prisma           = require("./lib/prisma");
const { seedAdmin }    = require("./lib/seed");
const authRouter       = require("./routes/auth");
const feedbacksRouter  = require("./routes/feedbacks");

const app = express();

// ── 1. Security headers — Helmet ──────────────────────────────────────────────
// Must be the very first middleware so headers are set on every response,
// including 404s and error responses.
app.use(
  helmet({
    // Allow Supabase signed URLs to be loaded in the same origin
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'"],
        styleSrc:    ["'self'", "'unsafe-inline'"],
        imgSrc:      ["'self'", "data:", "https:"],
        connectSrc:  ["'self'", "https://*.supabase.co"],
        fontSrc:     ["'self'"],
        objectSrc:   ["'none'"],
        frameSrc:    ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// ── 2. CORS — production lockdown ─────────────────────────────────────────────
// In production, requests with no Origin header (curl, Postman) are rejected.
// In development they are allowed to simplify local testing.
const allowedOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173,http://localhost:8080"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) {
        // Block no-origin requests in production; allow in dev
        if (process.env.NODE_ENV === "production") {
          return cb(new Error("Requests without an Origin header are not allowed in production."));
        }
        return cb(null, true);
      }
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' is not in the allowed list.`));
    },
    credentials: true,
    // Explicitly allow the Authorization header so browser preflight (OPTIONS)
    // responds with Access-Control-Allow-Headers: Authorization, Content-Type.
    // Without this the browser blocks any cross-origin fetch that sends a
    // custom header (like Authorization: Bearer ...) before it reaches the server.
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
    exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// ── 3. Body parsing — with hard payload size caps ─────────────────────────────
// Keeps JSON/URL-encoded bodies small; prevents JSON-bomb DoS attacks.
// Multipart (file upload) bodies are handled separately by multer in the route.
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// ── 4. Stored-XSS sanitisation ────────────────────────────────────────────────
// xss-clean strips <script> tags and HTML entities from req.body, req.query,
// and req.params before they ever reach a route handler.
app.use(xssClean());

// ── 5. HTTP request logging ───────────────────────────────────────────────────
// 'combined' includes IP + User-Agent (needed for incident investigation in prod).
// 'dev' gives coloured one-liners locally.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── 6. Global baseline rate limiter ──────────────────────────────────────────
// 200 requests per IP per 15-minute window.
// Specific endpoints (auth login, feedback submit) have tighter limits
// defined inside their own routers — this is only the backstop.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,   // Return RateLimit-* headers (RFC 6585)
    legacyHeaders: false,     // Disable X-RateLimit-* headers
    message: { error: "Too many requests from this IP. Please try again later." },
    // key by IP — trust the proxy in production (set trust proxy below if behind nginx/Cloudflare)
  })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRouter);
app.use("/api/feedbacks", feedbacksRouter);

// ── Health check ──────────────────────────────────────────────────────────────
// Intentionally placed AFTER auth/feedback routes so it doesn't catch their errors.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ── 7. Global error handler — zero internal leakage ──────────────────────────
// Four-argument signature is mandatory for Express to recognise this as an
// error handler. Never pass raw err.message to the client in production.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Always log the full error (with stack) server-side
  console.error("[error]", err);

  // ── Multer: file too large ────────────────────────────────────────────────
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: `File too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE_MB || 100} MB.`,
    });
  }

  // ── Multer: too many files ────────────────────────────────────────────────
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(422).json({ error: "Too many files. Maximum 10 attachments per submission." });
  }

  // ── CORS violation ────────────────────────────────────────────────────────
  if (err.message && err.message.startsWith("CORS")) {
    return res.status(403).json({ error: "Forbidden: cross-origin request blocked." });
  }

  // ── Prisma known-request errors (P2xxx) ───────────────────────────────────
  // Codes like P2002 (unique constraint) must never reach the client;
  // they contain table and column names from the schema.
  if (err.code && /^P\d{4}$/.test(err.code)) {
    return res.status(409).json({ error: "A database constraint was violated." });
  }

  // ── Generic fallback ──────────────────────────────────────────────────────
  // In production: always send a static, opaque message.
  // In development: include err.message to aid debugging.
  const safeMessage =
    process.env.NODE_ENV === "production"
      ? "An internal server error occurred."
      : err.message || "An internal server error occurred.";

  res.status(err.status || 500).json({ error: safeMessage });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT || 4000);

async function start() {
  await prisma.$connect();
  console.log("[db] Connected to Supabase PostgreSQL via Prisma ✓");

  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`\n🚀  BSW Feedback Portal API`);
    console.log(`   Listening  → http://localhost:${PORT}`);
    console.log(`   Health     → http://localhost:${PORT}/api/health`);
    console.log(`   Env        → ${process.env.NODE_ENV || "development"}\n`);
  });
}

start().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});

// Graceful shutdown — release DB connection pool cleanly
process.on("SIGINT",  async () => { await prisma.$disconnect(); process.exit(0); });
process.on("SIGTERM", async () => { await prisma.$disconnect(); process.exit(0); });

module.exports = app;
