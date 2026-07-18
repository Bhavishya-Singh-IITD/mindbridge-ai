"use strict";

const bcrypt = require("bcryptjs");
const prisma = require("./prisma");

/**
 * Ensures at least one admin account exists in the database.
 * Runs once on server startup; safe to call multiple times.
 */
async function seedAdmin() {
  const {
    ADMIN_EMAIL = "admin@iitd.ac.in",
    ADMIN_PASSWORD = "Admin@1234",
  } = process.env;

  const lowerEmail = ADMIN_EMAIL.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { email: lowerEmail, role: "admin" },
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: lowerEmail,
        passwordHash,
        role: "admin",
        userType: "admin",
      },
    });
    console.log(`[seed] Admin account created → ${lowerEmail}`);
  }
}

module.exports = { seedAdmin };
