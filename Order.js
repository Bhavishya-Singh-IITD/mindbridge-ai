import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  title:     { type: String, required: true },
  image:     { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, default: 1 },
  seller:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const shippingSchema = new mongoose.Schema({
  fullName:   { type: String, required: true },
  address:    { type: String, required: true },
  city:       { type: String, required: true },
  state:      { type: String, required: true },
  pincode:    { type: String, required: true },
  phone:      { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items:         [orderItemSchema],
    shippingInfo:  shippingSchema,
    paymentInfo: {
      razorpayOrderId:   String,
      razorpayPaymentId: String,
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
    },
    itemsPrice:    { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice:    { type: Number, required: true, default: 0 },
    orderStatus: {
      type: String,
      enum: ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
