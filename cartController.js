import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ── GET /api/cart ─────────────────────────────────────────────
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "title images price stock seller");

  if (!cart) {
    return res.status(200).json({ success: true, cart: { items: [], totalPrice: 0 } });
  }
  res.status(200).json({ success: true, cart });
};

// ── POST /api/cart  — add or increment item ───────────────────
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  if (product.stock < quantity) {
    return res.status(400).json({ success: false, message: "Insufficient stock." });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create new cart for this user
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity, price: product.price }],
    });
  } else {
    const existingItem = cart.items.find((i) => i.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }
    await cart.save();
  }

  await cart.populate("items.product", "title images price stock");
  res.status(200).json({ success: true, cart });
};

// ── PUT /api/cart/:itemId  — update quantity ──────────────────
export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found." });
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: "Item not in cart." });
  }

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate("items.product", "title images price stock");
  res.status(200).json({ success: true, cart });
};

// ── DELETE /api/cart/:itemId  — remove one item ───────────────
export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found." });
  }

  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.status(200).json({ success: true, message: "Item removed.", cart });
};

// ── DELETE /api/cart  — clear entire cart ────────────────────
export const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(200).json({ success: true, message: "Cart cleared." });
};
