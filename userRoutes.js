import { Router } from "express";
import {
  getAllUsers, getUserById, updateUser, deleteUser,
  toggleWishlist, getWishlist,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

// Wishlist routes (any authenticated user)
router.get   ("/wishlist",            protect, getWishlist);
router.post  ("/wishlist/:productId", protect, toggleWishlist);

// Admin-only routes
router.get   ("/",       protect, authorize("admin"), getAllUsers);
router.get   ("/:id",    protect, authorize("admin"), getUserById);
router.put   ("/:id",    protect, authorize("admin"), updateUser);
router.delete("/:id",    protect, authorize("admin"), deleteUser);

export default router;
