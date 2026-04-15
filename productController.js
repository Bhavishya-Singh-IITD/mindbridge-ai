import Product from "../models/Product.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryHelper.js";

// ── GET /api/products ─────────────────────────────────────────
// Supports: ?keyword=&category=&minPrice=&maxPrice=&sort=&page=&limit=
export const getProducts = async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  const query = {};

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sorting
  const sortOptions = {
    "newest":     { createdAt: -1 },
    "price-asc":  { price: 1 },
    "price-desc": { price: -1 },
    "rating":     { rating: -1 },
    "popular":    { soldCount: -1 },
  };
  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("seller", "name sellerProfile.verified")
    .sort(sortBy)
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count:   products.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    products,
  });
};

// ── GET /api/products/featured ────────────────────────────────
export const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true })
    .populate("seller", "name")
    .limit(8);
  res.status(200).json({ success: true, products });
};

// ── GET /api/products/:id ─────────────────────────────────────
export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("seller", "name avatar sellerProfile")
    .populate("reviews.user", "name avatar");

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  res.status(200).json({ success: true, product });
};

// ── POST /api/products  (seller only) ─────────────────────────
export const createProduct = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "At least one image is required." });
  }

  // Upload all images to Cloudinary concurrently
  const imageUploads = await Promise.all(
    req.files.map((file) => uploadToCloudinary(file.buffer, "artisan-hub/products"))
  );

  const product = await Product.create({
    ...req.body,
    images: imageUploads,
    seller: req.user._id,
  });

  res.status(201).json({ success: true, product });
};

// ── PUT /api/products/:id  (owner or admin) ───────────────────
export const updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  // Only the seller who created it or admin can update
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to update this product." });
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const newImages = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, "artisan-hub/products"))
    );
    req.body.images = [...product.images, ...newImages];
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  res.status(200).json({ success: true, product });
};

// ── DELETE /api/products/:id  (owner or admin) ────────────────
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to delete this product." });
  }

  // Delete all images from Cloudinary
  await Promise.all(product.images.map((img) => deleteFromCloudinary(img.public_id)));
  await product.deleteOne();

  res.status(200).json({ success: true, message: "Product deleted successfully." });
};

// ── POST /api/products/:id/reviews  (buyer only) ──────────────
export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  // One review per user
  const alreadyReviewed = product.reviews.some(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: "You have already reviewed this product." });
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.calcAverageRating();
  await product.save();

  res.status(201).json({ success: true, message: "Review added." });
};

// ── DELETE /api/products/:id/reviews/:reviewId ────────────────
export const deleteReview = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found." });
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to delete this review." });
  }

  review.deleteOne();
  product.calcAverageRating();
  await product.save();

  res.status(200).json({ success: true, message: "Review deleted." });
};
