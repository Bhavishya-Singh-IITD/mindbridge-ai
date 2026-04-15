import User from "../models/User.js";

// ── GET /api/users  (admin) ───────────────────────────────────
export const getAllUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, users });
};

// ── GET /api/users/:id  (admin) ───────────────────────────────
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  res.status(200).json({ success: true, user });
};

// ── PUT /api/users/:id  (admin — change role etc.) ────────────
export const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  res.status(200).json({ success: true, user });
};

// ── DELETE /api/users/:id  (admin) ───────────────────────────
export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  res.status(200).json({ success: true, message: "User deleted." });
};

// ── POST /api/users/wishlist/:productId  — toggle ─────────────
export const toggleWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { productId } = req.params;

  const index = user.wishlist.indexOf(productId);
  if (index === -1) {
    user.wishlist.push(productId);
  } else {
    user.wishlist.splice(index, 1);
  }

  await user.save();
  const action = index === -1 ? "added to" : "removed from";
  res.status(200).json({ success: true, message: `Product ${action} wishlist.`, wishlist: user.wishlist });
};

// ── GET /api/users/wishlist ────────────────────────────────────
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "wishlist",
    "title images price rating category seller"
  );
  res.status(200).json({ success: true, wishlist: user.wishlist });
};
