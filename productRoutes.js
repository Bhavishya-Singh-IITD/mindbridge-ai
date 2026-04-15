import { Router } from "express";
import {
  getProducts, getFeaturedProducts, getProduct,
  createProduct, updateProduct, deleteProduct,
  addReview, deleteReview,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get("/",           getProducts);
router.get("/featured",   getFeaturedProducts);
router.get("/:id",        getProduct);

router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 5),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 5),
  updateProduct
);

router.delete("/:id",     protect, authorize("seller", "admin"), deleteProduct);

router.post("/:id/reviews",               protect, addReview);
router.delete("/:id/reviews/:reviewId",   protect, deleteReview);

export default router;
