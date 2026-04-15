import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import "express-async-errors";

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes    from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes    from "./routes/cartRoutes.js";
import orderRoutes   from "./routes/orderRoutes.js";
import userRoutes    from "./routes/userRoutes.js";

// ── Connect to MongoDB ─────────────────────────────────────────
await connectDB();

const app = express();

// ── Security middleware ────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());       // prevent NoSQL injection

// Rate limiting — 100 requests per 15 minutes per IP
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests. Please try again later." },
  })
);

// ── Core middleware ────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL,
  credentials: true,             // allow cookies cross-origin
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));        // request logging in dev
}

// ── API Routes ─────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/users",    userRoutes);

// ── Health check ───────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Artisan Hub API is running 🎨" });
});

// ── 404 handler ────────────────────────────────────────────────
app.all("*", (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler (must be last) ───────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
