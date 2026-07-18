"use strict";

const express    = require("express");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const rateLimit  = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const prisma     = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ── Per-route rate limiter — brute-force protection ───────────────────────────
// Applied only to the three login endpoints, not to /logout or /me.
// 10 requests per IP per 15-minute window; failed attempts count toward the
// limit (skipSuccessfulRequests: true) so legitimate users are not penalised.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: "Too many login attempts from this IP. Please wait 15 minutes and try again.",
  },
});

// ── Dummy hash — used to keep response time constant when a user is not found ─
// bcrypt.compare() with this sentinel value always returns false but takes the
// same ~100 ms as a real comparison, closing the timing oracle on admin login.
const DUMMY_HASH = "$2b$12$invalidhashvaluethatisexactly53characterslongXXXXXXXXXXX";

// ── Helpers ───────────────────────────────────────────────────────────────────

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    algorithm: "HS256",
  });
}

/** Returns ONLY the fields the frontend needs — passwordHash never included. */
function formatUser(user) {
  return {
    id:       user.id,
    name:     user.name,
    email:    user.email,
    role:     user.role,
    userType: user.userType,
    subRole:  user.subRole ?? undefined,
  };
}

/**
 * Runs express-validator and sends a 422 if any rules failed.
 * Returns only { field, message } pairs — raw user input is never reflected back.
 */
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

// ── POST /api/auth/login/iitd ─────────────────────────────────────────────────
// First login auto-registers the account; subsequent logins verify the password.
router.post(
  "/login/iitd",
  authLimiter,
  [
    body("email")
      .trim()
      .toLowerCase()
      .isEmail().withMessage("Must be a valid email.")
      .custom((v) => {
        if (!v.endsWith("@iitd.ac.in"))
          throw new Error("Email must be an @iitd.ac.in address.");
        return true;
      }),
    // Cap at 128 chars: bcrypt silently truncates beyond 72 bytes, so a huge
    // password doesn't improve security but wastes CPU.
    body("password")
      .isLength({ min: 1, max: 128 })
      .withMessage("Password must be between 1 and 128 characters."),
  ],
  async (req, res) => {
    if (validationGuard(req, res)) return;

    const lowerEmail = req.body.email.toLowerCase().trim();
    const { password } = req.body;

    try {
      let user = await prisma.user.findUnique({ where: { email: lowerEmail } });

      if (!user) {
        // ── Auto-register on first IITD login ──────────────────────────────
        const passwordHash = await bcrypt.hash(password, 12);
        const namePart = lowerEmail.split("@")[0];
        user = await prisma.user.create({
          data: {
            name:     namePart,
            email:    lowerEmail,
            passwordHash,
            role:     "user",     // HARDCODED — never from request body
            userType: "iitd",     // HARDCODED
            subRole:  "Student",
          },
        });
      } else {
        // ── Existing account: verify password ──────────────────────────────
        // FIX — account enumeration: admin emails previously revealed their
        // account type via a distinct error message. Now we always verify the
        // password first, then return the same generic "Invalid credentials."
        // regardless of whether the account exists, is an admin, or has the
        // wrong password.
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok || user.role === "admin") {
          return res.status(401).json({ error: "Invalid credentials." });
        }
      }

      res.json({ token: signToken(user.id), user: formatUser(user) });
    } catch (err) {
      console.error("[auth/iitd]", err);
      res.status(500).json({ error: "An error occurred. Please try again." });
    }
  }
);

// ── POST /api/auth/login/non-iitd ────────────────────────────────────────────
// If the email exists → verify password. Otherwise → create the account.
router.post(
  "/login/non-iitd",
  authLimiter,
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Name must be 1–100 characters."),
    body("email")
      .trim()
      .toLowerCase()
      .isEmail().withMessage("Must be a valid email.")
      .isLength({ max: 254 }).withMessage("Email too long."),
    body("password")
      .isLength({ min: 6, max: 128 })
      .withMessage("Password must be 6–128 characters."),
    body("subRole")
      .optional()
      .isIn(["Student", "Parent", "Professor", "TA", "Other"])
      .withMessage("Invalid role."),
  ],
  async (req, res) => {
    if (validationGuard(req, res)) return;

    const name       = req.body.name.trim();
    const lowerEmail = req.body.email.toLowerCase().trim();
    const { password, subRole = "Other" } = req.body;

    try {
      let user = await prisma.user.findUnique({ where: { email: lowerEmail } });

      if (!user) {
        const passwordHash = await bcrypt.hash(password, 12);
        user = await prisma.user.create({
          data: {
            name,
            email:    lowerEmail,
            passwordHash,
            role:     "user",       // HARDCODED — mass assignment protection
            userType: "non-iitd",   // HARDCODED
            subRole,
          },
        });
      } else {
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: "Invalid credentials." });
      }

      res.json({ token: signToken(user.id), user: formatUser(user) });
    } catch (err) {
      console.error("[auth/non-iitd]", err);
      res.status(500).json({ error: "An error occurred. Please try again." });
    }
  }
);

// ── POST /api/auth/login/admin ────────────────────────────────────────────────
router.post(
  "/login/admin",
  authLimiter,
  [
    body("email")
      .trim()
      .toLowerCase()
      .isEmail().withMessage("Must be a valid email."),
    body("password")
      .isLength({ min: 1, max: 128 })
      .withMessage("Password required (max 128 characters)."),
  ],
  async (req, res) => {
    if (validationGuard(req, res)) return;

    const lowerEmail = req.body.email.toLowerCase().trim();
    const { password } = req.body;

    try {
      const user = await prisma.user.findFirst({
        where: { email: lowerEmail, role: "admin" },
      });

      // FIX — timing oracle: the old code returned immediately when no admin
      // was found, giving attackers a measurable ~0 ms response vs. the ~100 ms
      // bcrypt takes for a real account. Now we ALWAYS call bcrypt.compare()
      // so the response time is identical whether the account exists or not.
      const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
      const ok = await bcrypt.compare(password, hashToCompare);

      // Deliberate single check — same generic message for non-existent account
      // AND wrong password. Never reveal whether the admin account exists.
      if (!user || !ok) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      res.json({ token: signToken(user.id), user: formatUser(user) });
    } catch (err) {
      console.error("[auth/admin]", err);
      res.status(500).json({ error: "An error occurred. Please try again." });
    }
  }
);

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// JWT is stateless — the client discards the token. No rate limit needed here.
router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out successfully." });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
