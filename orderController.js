import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ── POST /api/orders  — place order from current cart ─────────
export const placeOrder = async (req, res) => {
  const { shippingInfo } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Your cart is empty." });
  }

  // Validate stock for all items before proceeding
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `"${item.product.title}" is out of stock.`,
      });
    }
  }

  const itemsPrice    = cart.totalPrice;
  const shippingPrice = itemsPrice > 5000 ? 0 : 99; // free shipping above ₹5000
  const totalPrice    = itemsPrice + shippingPrice;

  const orderItems = cart.items.map((item) => ({
    product:  item.product._id,
    title:    item.product.title,
    image:    item.product.images[0]?.url || "",
    price:    item.price,
    quantity: item.quantity,
    seller:   item.product.seller,
  }));

  const order = await Order.create({
    user:         req.user._id,
    items:        orderItems,
    shippingInfo,
    itemsPrice,
    shippingPrice,
    totalPrice,
    paymentInfo:  { status: "pending" },
  });

  // Decrement stock for each product
  await Promise.all(
    cart.items.map((item) =>
      Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      })
    )
  );

  // Clear cart after successful order
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(201).json({ success: true, order });
};

// ── GET /api/orders/my  — current user's orders ───────────────
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, orders });
};

// ── GET /api/orders/:id  — single order detail ────────────────
export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  // Owner or admin only
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized." });
  }

  res.status(200).json({ success: true, order });
};

// ── GET /api/orders  — admin: all orders ──────────────────────
export const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  res.status(200).json({ success: true, count: orders.length, totalRevenue, orders });
};

// ── PUT /api/orders/:id/status  — admin: update status ────────
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }
  if (order.orderStatus === "Delivered") {
    return res.status(400).json({ success: false, message: "Order already delivered." });
  }

  order.orderStatus = status;
  if (status === "Delivered") {
    order.deliveredAt       = Date.now();
    order.paymentInfo.status = "paid";
  }

  await order.save();
  res.status(200).json({ success: true, order });
};
