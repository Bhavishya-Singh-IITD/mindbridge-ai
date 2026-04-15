import { useState } from "react";
import {
  ArrowRight, Users, CreditCard, DollarSign, Package,
  ShieldCheck, BadgeCheck, Truck, RotateCcw, Lock,
  Palette, Sparkles, Mail, Check,
} from "lucide-react";

import Hero             from "../components/Hero";
import CategoriesSection from "../components/CategoriesSection";
import FeaturedSection   from "../components/FeaturedSection";
import Footer            from "../components/Footer";
import { Reveal, SectionHeader } from "../components/SharedUI";
import { NOISE_URI, TRUST, WHY_US } from "../data/mockData";

// ── Seller Banner ──────────────────────────────────────────────
function SellerBanner() {
  const benefits = [
    { icon: Users,      text: "Reach buyers across India" },
    { icon: Package,    text: "Easy listing tools"        },
    { icon: CreditCard, text: "Secure payments"           },
    { icon: DollarSign, text: "Low 8% commission"         },
  ];
  return (
    <section
      className="relative overflow-hidden py-20 lg:py-24 px-6"
      style={{ background: "linear-gradient(135deg, #1C1917 0%, #0F0E0D 50%, #1C1008 100%)" }}
    >
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&h=600&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-[0.08]"
        />
      </div>
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%", right: "10%", transform: "translateY(-50%)",
          width: 600, height: 500,
          background: "radial-gradient(circle, rgba(180,83,9,0.15), transparent 65%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: NOISE_URI, backgroundSize: "180px", opacity: 0.04 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div>
            <span
              className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-[2px] mb-6"
              style={{
                fontFamily: "'Sora',sans-serif",
                color: "#FCD34D",
                background: "rgba(217,119,6,0.15)",
                border: "1px solid rgba(252,211,77,0.15)",
              }}
            >
              For Artists
            </span>
            <h2
              className="mb-5 font-bold leading-[1.18]"
              style={{
                fontFamily: "'Libre Baskerville',serif",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                color: "#FAF8F5",
                textShadow: "0 0 40px rgba(217,119,6,0.2)",
              }}
            >
              Sell Your Artwork
              <br />
              <span style={{ color: "#FCD34D", fontStyle: "italic", fontWeight: 400 }}>
                to the World
              </span>
            </h2>
            <p
              className="text-sm mb-8 max-w-md leading-relaxed"
              style={{ color: "rgba(250,248,245,0.45)", fontFamily: "'Sora',sans-serif" }}
            >
              Join 8,000+ Indian artists earning from their passion. List your artwork in minutes and
              reach collectors nationwide.
            </p>
            <button
              className="px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5"
              style={{
                fontFamily: "'Sora',sans-serif",
                background: "linear-gradient(135deg, #D97706, #92400E)",
                boxShadow: "0 8px 30px rgba(180,83,9,0.3)",
              }}
            >
              Start Selling <ArrowRight size={14} className="inline ml-1.5 -mt-px" />
            </button>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-3">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <Reveal key={b.text} delay={i * 80}>
                <div
                  className="flex items-start gap-3 p-5 rounded-2xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(217,119,6,0.15)",
                      border: "1px solid rgba(252,211,77,0.1)",
                    }}
                  >
                    <Icon size={17} color="#FCD34D" strokeWidth={1.5} />
                  </div>
                  <span
                    className="text-xs font-medium leading-relaxed mt-1.5"
                    style={{ color: "rgba(250,248,245,0.55)", fontFamily: "'Sora',sans-serif" }}
                  >
                    {b.text}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Trust Band ─────────────────────────────────────────────────
function TrustBand() {
  return (
    <section
      className="relative py-10 px-6"
      style={{
        background: "linear-gradient(to right, #FDF8F0, #FAF6ED, #FDF8F0)",
        borderTop: "1px solid rgba(217,119,6,0.08)",
        borderBottom: "1px solid rgba(217,119,6,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {TRUST.map((t, i) => {
          const Icon = t.icon;
          return (
            <Reveal key={t.label} delay={i * 60}>
              <div
                className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 cursor-default"
                style={{ transition: "all 0.3s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(180,83,9,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(254,243,199,0.9), rgba(253,230,138,0.4))",
                    border: "1px solid rgba(217,119,6,0.18)",
                  }}
                >
                  <Icon size={17} color="#B45309" strokeWidth={1.5} />
                </div>
                <div>
                  <div
                    className="text-xs font-bold text-stone-700"
                    style={{ fontFamily: "'Sora',sans-serif" }}
                  >
                    {t.label}
                  </div>
                  <div
                    className="text-stone-400 mt-0.5"
                    style={{ fontFamily: "'Sora',sans-serif", fontSize: 10 }}
                  >
                    {t.sub}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ── Why Choose Us ──────────────────────────────────────────────
function WhyChooseUs() {
  return (
    <section
      className="relative py-20 px-6"
      style={{ background: "linear-gradient(to bottom, #FDF8F0, #FAF8F5, #FAF6ED)" }}
    >
      <div
        className="absolute inset-0 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: NOISE_URI, backgroundSize: "180px", opacity: 0.02 }}
      />
      <div className="relative max-w-7xl mx-auto">
        <Reveal>
          <SectionHeader tag="Why Artisan Hub" title="A Marketplace Built for Art" />
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY_US.map((w, i) => {
            const Icon = w.icon;
            return (
              <Reveal key={i} delay={i * 80}>
                <div
                  className="group p-7 rounded-2xl transition-all duration-300 cursor-default"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(217,119,6,0.08)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 16px 48px rgba(180,83,9,0.1)";
                    e.currentTarget.style.transform = "translateY(-8px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: "linear-gradient(135deg, rgba(254,243,199,0.9), rgba(253,230,138,0.4))",
                      border: "1px solid rgba(217,119,6,0.2)",
                    }}
                  >
                    <Icon size={21} color="#B45309" strokeWidth={1.5} />
                  </div>
                  <h3
                    className="text-sm font-bold mb-2.5 text-stone-800"
                    style={{ fontFamily: "'Sora',sans-serif" }}
                  >
                    {w.title}
                  </h3>
                  <p
                    className="text-xs leading-[1.8] text-stone-400"
                    style={{ fontFamily: "'Sora',sans-serif" }}
                  >
                    {w.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Newsletter ─────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section
      className="relative py-20 px-6 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #FAF6ED, #FFFFFF)" }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 600,
          height: 300,
          background: "radial-gradient(ellipse, rgba(253,230,138,0.25), transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <Reveal>
        <div className="relative max-w-xl mx-auto text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(254,243,199,0.9), rgba(253,230,138,0.4))",
              border: "1px solid rgba(217,119,6,0.2)",
              boxShadow: "0 8px 24px rgba(180,83,9,0.12)",
            }}
          >
            <Mail size={22} color="#B45309" strokeWidth={1.5} />
          </div>
          <h2
            className="mb-2 font-bold text-stone-900"
            style={{
              fontFamily: "'Libre Baskerville',serif",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
            }}
          >
            Get Updates on New Artworks
          </h2>
          <p className="text-sm mb-8 text-stone-400" style={{ fontFamily: "'Sora',sans-serif" }}>
            Be first to discover new arrivals and exclusive collections.
          </p>
          {done ? (
            <div
              className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl"
              style={{ background: "rgba(240,253,244,0.8)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <Check size={17} className="text-green-600" />
              <span
                className="text-sm font-semibold text-green-700"
                style={{ fontFamily: "'Sora',sans-serif" }}
              >
                You're subscribed! Welcome aboard.
              </span>
            </div>
          ) : (
            <div
              className="flex items-center rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(217,119,6,0.15)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
              }}
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent outline-none px-5 py-4 text-sm text-stone-700 placeholder-stone-300"
                style={{ fontFamily: "'Sora',sans-serif" }}
              />
              <button
                onClick={() => { if (email) setDone(true); }}
                className="px-6 py-4 text-sm font-bold shrink-0 text-amber-50 transition-all duration-200 hover:brightness-110"
                style={{
                  background: "linear-gradient(to right, #D97706, #92400E)",
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

// ── Home page assembly ─────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Hero />
      <CategoriesSection />
      <FeaturedSection />
      <SellerBanner />
      <TrustBand />
      <WhyChooseUs />
      <Newsletter />
      <Footer />
    </>
  );
}
