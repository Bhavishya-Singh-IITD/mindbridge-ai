import {
  Palette, Camera, PenTool, Image, Printer, Gem, Box, Waves,
  ShieldCheck, BadgeCheck, Truck, RotateCcw, Lock, Sparkles,
} from "lucide-react";

// ── Formatting helper ──────────────────────────────────────────
export const fmt = (n) => "₹" + n.toLocaleString("en-IN");

// ── Noise texture URI (shared across sections) ─────────────────
export const NOISE_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`;

// ── Categories ─────────────────────────────────────────────────
export const CATEGORIES = [
  { name: "Paintings",    icon: Palette,  img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop" },
  { name: "Digital Art",  icon: Image,    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop" },
  { name: "Sketches",     icon: PenTool,  img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop" },
  { name: "Photography",  icon: Camera,   img: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&h=400&fit=crop" },
  { name: "Prints",       icon: Printer,  img: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop" },
  { name: "Handmade",     icon: Gem,      img: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop" },
  { name: "Sculptures",   icon: Box,      img: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=400&h=400&fit=crop" },
  { name: "Abstract",     icon: Waves,    img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop" },
];

// ── Products ───────────────────────────────────────────────────
export const PRODUCTS = {
  trending: [
    { id: 1,  title: "Monsoon Reverie",     artist: "Ananya Sharma",   price: 7999,  img: "https://picsum.photos/500/625?random=1",  rating: 4.8 },
    { id: 2,  title: "Urban Solitude",      artist: "Vikram Desai",    price: 12500, img: "https://picsum.photos/500/625?random=2",  rating: 4.9 },
    { id: 3,  title: "Terracotta Bloom",    artist: "Meera Iyer",      price: 3499,  img: "https://picsum.photos/500/625?random=3",  rating: 4.7 },
    { id: 4,  title: "Indigo Passage",      artist: "Rohan Kapoor",    price: 5250,  img: "https://picsum.photos/500/625?random=4",  rating: 4.6 },
  ],
  bestsellers: [
    { id: 5,  title: "Temple at Dawn",      artist: "Priya Nair",      price: 8999,  img: "https://picsum.photos/500/625?random=5",  rating: 5.0 },
    { id: 6,  title: "Kaleidoscope Garden", artist: "Arjun Mehta",     price: 1299,  img: "https://picsum.photos/500/625?random=6",  rating: 4.8 },
    { id: 7,  title: "Ocean of Silence",    artist: "Kavya Reddy",     price: 15000, img: "https://picsum.photos/500/625?random=7",  rating: 4.9 },
    { id: 8,  title: "Spice Market Hues",   artist: "Siddharth Joshi", price: 4750,  img: "https://picsum.photos/500/625?random=8",  rating: 4.7 },
  ],
  newArrivals: [
    { id: 9,  title: "Himalayan Mist",      artist: "Ishita Gupta",    price: 6499,  img: "https://picsum.photos/500/625?random=9",  rating: 4.5 },
    { id: 10, title: "Chromatic Pulse",     artist: "Dhruv Patel",     price: 899,   img: "https://picsum.photos/500/625?random=10", rating: 4.4 },
    { id: 11, title: "Woven Traditions",    artist: "Lakshmi Rao",     price: 11200, img: "https://picsum.photos/500/625?random=11", rating: 4.8 },
    { id: 12, title: "Neon Ganges",         artist: "Kabir Singh",     price: 3200,  img: "https://picsum.photos/500/625?random=12", rating: 4.6 },
  ],
};

// ── Trust signals ──────────────────────────────────────────────
export const TRUST = [
  { icon: Lock,         label: "Secure Payments",  sub: "SSL encrypted"      },
  { icon: BadgeCheck,   label: "Verified Artists",  sub: "ID confirmed"       },
  { icon: Truck,        label: "Fast Delivery",     sub: "Pan-India shipping" },
  { icon: RotateCcw,    label: "Easy Returns",      sub: "7-day policy"       },
  { icon: ShieldCheck,  label: "Buyer Protection",  sub: "100% coverage"      },
];

// ── Why choose us ──────────────────────────────────────────────
export const WHY_US = [
  { icon: Palette,      title: "Direct From Artists",  desc: "Every piece ships straight from the creator's studio. Zero middlemen, authentic connection with the artist behind the work." },
  { icon: Sparkles,     title: "Unique Originals",     desc: "One-of-a-kind artworks with certificates of authenticity. No mass-produced prints — only genuine creative expression." },
  { icon: ShieldCheck,  title: "Secure Marketplace",   desc: "Bank-grade encryption on every transaction. Payment held in escrow until you confirm you love your new artwork." },
  { icon: BadgeCheck,   title: "Verified Sellers",     desc: "Every artist undergoes identity verification and portfolio review before listing. Quality you can trust." },
];
