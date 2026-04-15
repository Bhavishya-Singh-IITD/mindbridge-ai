import { useState } from "react";
import { Heart, Star, Eye, Check, ShoppingCart } from "lucide-react";
import { fmt } from "../data/mockData";

export default function ProductCard({ product, wished, onWish, onCart, inCart }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(217,119,6,0.08)",
        boxShadow: hover
          ? "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(180,83,9,0.08)"
          : "0 2px 12px rgba(0,0,0,0.05)",
        transform: hover ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
        <img
          src={product.img}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Hover gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to top, rgba(28,25,23,0.55) 0%, rgba(28,25,23,0.05) 50%, transparent 100%)",
            opacity: hover ? 1 : 0,
          }}
        />

        {/* Rating badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg"
          style={{
            background: "rgba(255,255,255,0.93)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(217,119,6,0.1)",
          }}
        >
          <Star size={10} fill="#F59E0B" stroke="#F59E0B" />
          <span
            className="font-bold text-stone-700"
            style={{ fontFamily: "'Sora',sans-serif", fontSize: 10 }}
          >
            {product.rating}
          </span>
        </div>

        {/* Quick View (hover reveal) */}
        <div
          className={`absolute bottom-3 inset-x-3 transition-all duration-300 ${
            hover ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <button
            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(8px)",
              color: "#1C1917",
              fontFamily: "'Sora',sans-serif",
            }}
          >
            <Eye size={12} /> Quick View
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4">
        <p
          className="mb-0.5 uppercase tracking-wide text-stone-400"
          style={{ fontFamily: "'Sora',sans-serif", fontSize: 10 }}
        >
          {product.artist}
        </p>
        <h3
          className="text-sm font-semibold mb-3 truncate text-stone-800"
          style={{ fontFamily: "'Libre Baskerville',serif" }}
        >
          {product.title}
        </h3>
        <div className="mb-3">
          <span
            className="text-lg font-bold text-amber-700"
            style={{ fontFamily: "'Libre Baskerville',serif" }}
          >
            {fmt(product.price)}
          </span>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-center gap-2">
          {/* Add / Added to Cart toggle */}
          <button
            onClick={() => onCart(product.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
            style={{
              fontFamily: "'Sora',sans-serif",
              background: inCart
                ? "linear-gradient(135deg, #16A34A, #15803D)"
                : "linear-gradient(135deg, #D97706, #92400E)",
              color: inCart ? "#FFFFFF" : "#FEF3C7",
              boxShadow: inCart
                ? "0 4px 14px rgba(22,163,74,0.25)"
                : "0 4px 14px rgba(180,83,9,0.25)",
              cursor: "pointer",
              transition: "background 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease",
            }}
          >
            {inCart ? (
              <><Check size={13} strokeWidth={2.5} /> Added to Cart</>
            ) : (
              <><ShoppingCart size={13} strokeWidth={1.8} /> Add to Cart</>
            )}
          </button>

          {/* Wishlist toggle */}
          <button
            onClick={() => onWish(product.id)}
            className="flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              border: wished
                ? "1.5px solid rgba(239,68,68,0.4)"
                : "1.5px solid rgba(0,0,0,0.08)",
              background: wished ? "rgba(254,242,242,0.9)" : "rgba(250,248,245,0.7)",
            }}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={15}
              fill={wished ? "#EF4444" : "none"}
              stroke={wished ? "#EF4444" : "#9CA3AF"}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
