import { useState } from "react";
import { ArrowRight, TrendingUp, Award, Clock } from "lucide-react";
import { PRODUCTS, NOISE_URI } from "../data/mockData";
import { useStore } from "../context/StoreContext";
import { Reveal } from "./SharedUI";
import ProductCard from "./ProductCard";

export default function FeaturedSection() {
  // Reads cart/wishlist state directly from context — no props needed
  const { isInCart, toggleCart, isWished, toggleWish } = useStore();

  const [tab, setTab] = useState("trending");

  const tabs = [
    { key: "trending",    label: "Trending",     icon: TrendingUp },
    { key: "bestsellers", label: "Best Sellers",  icon: Award      },
    { key: "newArrivals", label: "New Arrivals",  icon: Clock      },
  ];

  return (
    <section
      className="relative py-20 px-6"
      style={{ background: "linear-gradient(to bottom, #FAF6ED, #FFFFFF, #FDF8F0)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 700,
          height: 200,
          background: "radial-gradient(ellipse, rgba(253,230,138,0.2), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      {/* Noise */}
      <div
        className="absolute inset-0 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: NOISE_URI, backgroundSize: "180px", opacity: 0.02 }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* ── Section heading + tab switcher ── */}
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <span
                className="font-bold uppercase tracking-[3px] text-amber-600"
                style={{ fontFamily: "'Sora',sans-serif", fontSize: 10 }}
              >
                Featured
              </span>
              <h2
                className="mt-2 font-bold text-stone-900"
                style={{
                  fontFamily: "'Libre Baskerville',serif",
                  fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
                }}
              >
                Discover Exceptional Art
              </h2>
            </div>

            {/* Tab switcher */}
            <div
              className="flex items-center gap-1 p-1.5 rounded-2xl self-start"
              style={{
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(217,119,6,0.1)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      background:
                        tab === t.key ? "linear-gradient(135deg, #D97706, #92400E)" : "transparent",
                      color: tab === t.key ? "#FEF3C7" : "#9CA3AF",
                      boxShadow: tab === t.key ? "0 4px 12px rgba(180,83,9,0.2)" : "none",
                    }}
                  >
                    <Icon size={12} />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* ── Product grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCTS[tab].map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard
                product={p}
                wished={isWished(p.id)}
                onWish={toggleWish}
                onCart={toggleCart}
                inCart={isInCart(p.id)}
              />
            </Reveal>
          ))}
        </div>

        {/* ── View all CTA ── */}
        <Reveal>
          <div className="text-center mt-12">
            <button
              className="px-8 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
              style={{
                fontFamily: "'Sora',sans-serif",
                border: "2px solid rgba(180,83,9,0.3)",
                color: "#B45309",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg,#D97706,#92400E)";
                e.currentTarget.style.color = "#FEF3C7";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(180,83,9,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#B45309";
                e.currentTarget.style.borderColor = "rgba(180,83,9,0.3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              View All Artworks <ArrowRight size={13} className="inline ml-1 -mt-px" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
