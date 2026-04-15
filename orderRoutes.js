import { Router } from "express";
import {
  placeOrder, getMyOrders, getOrder,
  getAllOrders, updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect); // all order routes require login

router.post("/",                              placeOrder);
router.get ("/my",                            getMyOrders);
router.get ("/:id",                           getOrder);

// Admin only
router.get ("/",         authorize("admin"),  getAllOrders);
router.put ("/:id/status", authorize("admin"), updateOrderStatus);

export default router;
