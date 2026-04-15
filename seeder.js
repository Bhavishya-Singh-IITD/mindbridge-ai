import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User    from "../models/User.js";
import Product from "../models/Product.js";
import Order   from "../models/Order.js";
import Cart    from "../models/Cart.js";

await connectDB();

// ── Sample users ───────────────────────────────────────────────
const users = [
  {
    name: "Admin User",
    email: "admin@artisanhub.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Ananya Sharma",
    email: "ananya@artisanhub.com",
    password: "seller123",
    role: "seller",
    sellerProfile: { bio: "Watercolor artist from Jaipur.", location: "Jaipur", verified: true },
  },
  {
    name: "Vikram Desai",
    email: "vikram@artisanhub.com",
    password: "seller123",
    role: "seller",
    sellerProfile: { bio: "Oil painter inspired by urban India.", location: "Mumbai", verified: true },
  },
  {
    name: "Test Buyer",
    email: "buyer@artisanhub.com",
    password: "buyer123",
    role: "buyer",
  },
];

// ── Sample products factory ────────────────────────────────────
const makeProducts = (sellerId1, sellerId2) => [
  {
    title: "Monsoon Reverie",
    description: "A dreamlike watercolor capturing the essence of India's monsoon season. Soft blues and greens blend into hazy shapes evoking rain-soaked streets.",
    price: 7999,
    category: "Paintings",
    medium: "Watercolor on paper",
    dimensions: "18 x 24 inches",
    images: [{ public_id: "sample_1", url: "https://picsum.photos/500/625?random=1" }],
    seller: sellerId1,
    stock: 1,
    isFeatured: true,
    rating: 4.8,
    numReviews: 12,
  },
  {
    title: "Urban Solitude",
    description: "A contemplative oil painting of empty city streets at dawn. Deep shadows and warm lamplight create a mood of quiet introspection.",
    price: 12500,
    category: "Paintings",
    medium: "Oil on canvas",
    dimensions: "24 x 36 inches",
    images: [{ public_id: "sample_2", url: "https://picsum.photos/500/625?random=2" }],
    seller: sellerId2,
    stock: 1,
    isFeatured: true,
    rating: 4.9,
    numReviews: 8,
  },
  {
    title: "Terracotta Bloom",
    description: "Inspired by the terracotta pottery traditions of West Bengal. Earthy tones and organic forms celebrate India's rich craft heritage.",
    price: 3499,
    category: "Abstract",
    medium: "Acrylic on canvas",
    dimensions: "12 x 16 inches",
    images: [{ public_id: "sample_3", url: "https://picsum.photos/500/625?random=3" }],
    seller: sellerId1,
    stock: 3,
    isFeatured: false,
    rating: 4.7,
    numReviews: 5,
  },
  {
    title: "Indigo Passage",
    description: "A journey through indigo-dyed textiles of Rajasthan rendered in bold abstract strokes. A celebration of colour and craft.",
    price: 5250,
    category: "Abstract",
    medium: "Mixed media",
    dimensions: "20 x 20 inches",
    images: [{ public_id: "sample_4", url: "https://picsum.photos/500/625?random=4" }],
    seller: sellerId2,
    stock: 2,
    isFeatured: true,
    rating: 4.6,
    numReviews: 7,
  },
  {
    title: "Temple at Dawn",
    description: "Golden light spills across ancient stone temples. A photographic study capturing India's spiritual architecture at its most serene.",
    price: 8999,
    category: "Photography",
    medium: "Fine art print",
    dimensions: "16 x 20 inches",
    images: [{ public_id: "sample_5", url: "https://picsum.photos/500/625?random=5" }],
    seller: sellerId1,
    stock: 5,
    isFeatured: true,
    rating: 5.0,
    numReviews: 20,
  },
  {
    title: "Himalayan Mist",
    description: "Soft graphite sketches of Himalayan peaks shrouded in morning fog. Minimal yet deeply atmospheric.",
    price: 6499,
    category: "Sketches",
    medium: "Graphite on archival paper",
    dimensions: "14 x 18 inches",
    images: [{ public_id: "sample_9", url: "https://picsum.photos/500/625?random=9" }],
    seller: sellerId2,
    stock: 1,
    isFeatured: false,
    rating: 4.5,
    numReviews: 4,
  },
  {
    title: "Woven Traditions",
    description: "A handwoven textile piece celebrating the weaving traditions of Varanasi. Each thread tells a story of generational craft.",
    price: 11200,
    category: "Handmade",
    medium: "Silk and cotton weave",
    dimensions: "24 x 36 inches",
    images: [{ public_id: "sample_11", url: "https://picsum.photos/500/625?random=11" }],
    seller: sellerId1,
    stock: 2,
    isFeatured: true,
    rating: 4.8,
    numReviews: 9,
  },
  {
    title: "Neon Ganges",
    description: "A bold digital artwork reimagining the Ganges river as a neon dreamscape. Where tradition meets cyberpunk.",
    price: 3200,
    category: "Digital Art",
    medium: "Digital print on archival paper",
    dimensions: "18 x 24 inches",
    images: [{ public_id: "sample_12", url: "https://picsum.photos/500/625?random=12" }],
    seller: sellerId2,
    stock: 10,
    isFeatured: false,
    rating: 4.6,
    numReviews: 6,
  },
];

// ── Run seeder ─────────────────────────────────────────────────
const seedDB = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    console.log("🗑️  Existing data cleared.");

    // Create users
    const createdUsers = await User.create(users);
    const seller1 = createdUsers[1]._id;
    const seller2 = createdUsers[2]._id;
    console.log(`👤 ${createdUsers.length} users created.`);

    // Create products
    const products = makeProducts(seller1, seller2);
    await Product.create(products);
    console.log(`🎨 ${products.length} products created.`);

    console.log("\n✅ Database seeded successfully!\n");
    console.log("─────────────────────────────────────────");
    console.log("  Login credentials:");
    console.log("  Admin  → admin@artisanhub.com   / admin123");
    console.log("  Seller → ananya@artisanhub.com  / seller123");
    console.log("  Buyer  → buyer@artisanhub.com   / buyer123");
    console.log("─────────────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

// Pass --destroy flag to wipe without re-seeding: node seeder.js --destroy
if (process.argv[2] === "--destroy") {
  (async () => {
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    console.log("🗑️  All data destroyed.");
    process.exit(0);
  })();
} else {
  seedDB();
}
