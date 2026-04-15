import { ArrowRight, Star } from "lucide-react";
import { NOISE_URI } from "../data/mockData";

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ marginTop: 90, minHeight: 640 }}>
      {/* ── Background layers ── */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&h=900&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(28,25,23,0.90) 0%, rgba(28,25,23,0.60) 50%, rgba(120,53,15,0.75) 100%)",
          }}
        />
        {/* Warm radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "30%",
            left: "15%",
            width: 560,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217,119,6,0.22) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Noise overlay */}
        <div
          className="absolute inset-0 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: NOISE_URI, backgroundSize: "200px", opacity: 0.05 }}
        />
      </div>

      {/* ── Floating decorative orbs ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 60,
          right: 80,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.15), transparent)",
          filter: "blur(20px)",
          animation: "heroOrb 7s ease-in-out infinite",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 100,
          right: 160,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(180,83,9,0.12), transparent)",
          filter: "blur(14px)",
          animation: "heroOrb 9s ease-in-out infinite reverse",
        }}
      />

      {/* ── Content ── */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-6 flex items-center"
        style={{ minHeight: 640 }}
      >
        <div className="max-w-2xl py-20">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full"
            style={{
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.18)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Star size={11} fill="#FBBF24" stroke="#FBBF24" />
            <span
              className="text-amber-200/80 uppercase tracking-[2.5px]"
              style={{ fontSize: 10, fontFamily: "'Sora',sans-serif", fontWeight: 600 }}
            >
              India's Premier Art Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-bold leading-[1.1] mb-6"
            style={{
              fontFamily: "'Libre Baskerville',serif",
              color: "#FAF8F5",
              fontSize: "clamp(2.3rem, 5.5vw, 3.8rem)",
              textShadow: "0 0 80px rgba(217,119,6,0.25)",
            }}
          >
            Buy & Sell Original
            <br />
            <span
              style={{
                color: "#FCD34D",
                fontStyle: "italic",
                fontWeight: 400,
                textShadow: "0 0 50px rgba(251,191,36,0.35)",
              }}
            >
              Artwork Directly
            </span>
            <br />
            From Creators
          </h1>

          {/* Body */}
          <p
            className="mb-10 max-w-md leading-relaxed"
            style={{ color: "rgba(250,248,245,0.55)", fontFamily: "'Sora',sans-serif", fontSize: 14 }}
          >
            Discover thousands of unique paintings, digital art, and handcrafted pieces from verified
            Indian artists. Prices starting at just ₹499.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button
              className="px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              style={{
                fontFamily: "'Sora',sans-serif",
                background: "linear-gradient(135deg, #D97706, #92400E)",
                boxShadow: "0 8px 30px rgba(180,83,9,0.35)",
              }}
            >
              Shop Now <ArrowRight size={14} className="inline ml-1.5 -mt-px" />
            </button>
            <button
              className="px-8 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 hover:bg-white/10"
              style={{
                fontFamily: "'Sora',sans-serif",
                color: "#FAF8F5",
                border: "1.5px solid rgba(250,248,245,0.2)",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(8px)",
              }}
            >
              Become a Seller
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-10 mt-12">
            {[["15K+", "Artworks"], ["8K+", "Artists"], ["50K+", "Buyers"]].map(([n, l]) => (
              <div key={l}>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#FCD34D", fontFamily: "'Libre Baskerville',serif" }}
                >
                  {n}
                </div>
                <div
                  className="mt-0.5 uppercase tracking-widest"
                  style={{ color: "rgba(250,248,245,0.35)", fontFamily: "'Sora',sans-serif", fontSize: 9 }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bleed into next section ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to top, #FAF8F5, transparent)" }}
      />
    </section>
  );
}
