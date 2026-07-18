"use strict";

/**
 * Prisma Client singleton.
 *
 * In development, nodemon restarts the process on every file change.
 * Without the global singleton pattern, each restart would leak a new
 * PrismaClient connection, eventually exhausting the Supabase connection pool.
 */

const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
