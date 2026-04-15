import mongoose from "mongoose";
import slugify from "slugify";

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    slug: { type: String, unique: true },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Paintings", "Digital Art", "Sketches", "Photography", "Prints", "Handmade", "Sculptures", "Abstract"],
    },
    images: [
      {
        public_id: { type: String, required: true },
        url:       { type: String, required: true },
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 1,
    },
    medium:      { type: String, default: "" },   // e.g. "Oil on canvas"
    dimensions:  { type: String, default: "" },   // e.g. "24 x 36 inches"
    isFeatured:  { type: Boolean, default: false },
    isOriginal:  { type: Boolean, default: true },
    reviews:     [reviewSchema],
    numReviews:  { type: Number, default: 0 },
    rating:      { type: Number, default: 0 },
    soldCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Recalculate average rating when reviews change
productSchema.methods.calcAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

// Index for search performance
productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1 });

export default mongoose.model("Product", productSchema);
