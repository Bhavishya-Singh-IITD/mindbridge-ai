"use strict";

const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

/**
 * Middleware: require a valid Bearer JWT.
 * Attaches req.user = { id, name, email, role, userType, subRole }
 */
async function requireAuth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user on every request — detects deleted / demoted accounts
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, userType: true, subRole: true },
    });

    if (!user) return res.status(401).json({ error: "User not found." });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

/**
 * Middleware: require role === "admin".
 * Must be used AFTER requireAuth.
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
