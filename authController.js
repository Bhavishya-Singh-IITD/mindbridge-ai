import User from "../models/User.js";
import { sendTokenResponse } from "../utils/jwt.js";

// ── POST /api/auth/register ────────────────────────────────────
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Prevent self-promotion to admin
  const safeRole = role === "admin" ? "buyer" : (role || "buyer");

  const user = await User.create({ name, email, password, role: safeRole });
  sendTokenResponse(user, 201, res, "Account created successfully.");
};

// ── POST /api/auth/login ───────────────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  // Explicitly select password since it's excluded by default
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  sendTokenResponse(user, 200, res, "Logged in successfully.");
};

// ── POST /api/auth/logout ──────────────────────────────────────
export const logout = (req, res) => {
  res
    .cookie("token", "none", { expires: new Date(Date.now() + 5 * 1000), httpOnly: true })
    .status(200)
    .json({ success: true, message: "Logged out successfully." });
};

// ── GET /api/auth/me ───────────────────────────────────────────
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist", "title images price");
  res.status(200).json({ success: true, user });
};

// ── PUT /api/auth/update-profile ──────────────────────────────
export const updateProfile = async (req, res) => {
  const { name, sellerProfile } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (sellerProfile) updates.sellerProfile = { ...req.user.sellerProfile, ...sellerProfile };

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true, runValidators: true,
  });
  res.status(200).json({ success: true, user });
};

// ── PUT /api/auth/change-password ─────────────────────────────
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: "Current password is incorrect." });
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res, "Password changed successfully.");
};
