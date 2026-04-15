// src/routes/authRoutes.js
import { Router } from "express";
import { register, login, logout, getMe, updateProfile, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register",         register);
router.post("/login",            login);
router.post("/logout",           logout);
router.get ("/me",               protect, getMe);
router.put ("/update-profile",   protect, updateProfile);
router.put ("/change-password",  protect, changePassword);

export default router;
