import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Heart, User, ChevronDown, Menu, X,
  Gem, Sparkles, MapPin, Globe, Package, ShoppingCart,
} from "lucide-react";
import { CATEGORIES } from "../data/mockData";
import { useStore } from "../context/StoreContext";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

// ── Labeled icon button (icon + text label stacked) ────────────
function LabeledIconBtn({ icon: Icon, label, count, to }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => to && navigate(to)}
      className="relative flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-amber-50/70 transition-all duration-200"
      style={{ minWidth: 44 }}
    >
      <div className="relative">
        <Icon size={18} className="text-stone-400" strokeWidth={1.6} />
        {count > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 rounded-full text-white flex items-center justify-center font-bold"
            style={{
              background: "linear-gradient(135deg,#D97706,#92400E)",
              fontSize: 9,
              width: 16,
              height: 16,
              boxShadow: "0 2px 6px rgba(180,83,9,0.3)",
            }}
          >
            {count}
          </span>
        )}
      </div>
      <span
        className="text-stone-600 leading-none select-none"
        style={{ fontSize: 9, fontFamily: "'Sora',sans-serif", fontWeight: 600 }}
      >
        {label}
      </span>
    </button>
  );
}

// ── Header ─────────────────────────────────────────────────────
export default function Header() {
  const { cartCount, wishCount } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "shadow-lg shadow-amber-900/5 backdrop-blur-xl border-b border-amber-200/30"
            : "backdrop-blur-md border-b border-amber-100/20"
        }`}
        style={{
          background: scrolled
            ? "rgba(250,248,245,0.96)"
            : "rgba(250,248,245,0.85)",
        }}
      >
        {/* ── Utility bar ── */}
        <div
          className="hidden lg:flex items-center justify-between max-w-7xl mx-auto px-8 border-b border-amber-100/30"
          style={{ height: 32, fontSize: 10, color: "#A8A29E", fontFamily: "'Sora',sans-serif" }}
        >
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1"><MapPin size={9} /> India</span>
            <span className="flex items-center gap-1"><Globe size={9} /> English</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-amber-700 transition-colors">Help</a>
            <a href="#" className="hover:text-amber-700 transition-colors">Track Order</a>
          </div>
        </div>

        <div
          className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between gap-3"
          style={{ height: 58 }}
        >
          {/* ── Logo ── */}
          <div
            onClick={scrollToTop}
            role="button"
            aria-label="Scroll to top"
            className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #D97706, #92400E)",
                boxShadow: "0 4px 14px rgba(180,83,9,0.25)",
              }}
            >
              <Gem size={17} color="#FEF3C7" strokeWidth={1.8} />
            </div>
            <div className="hidden sm:block">
              <span
                className="text-base font-bold tracking-tight block leading-none text-stone-900"
                style={{ fontFamily: "'Libre Baskerville',serif" }}
              >
                Artisan Hub
              </span>
              <span
                className="text-stone-400 uppercase tracking-[3px]"
                style={{ fontFamily: "'Sora',sans-serif", fontSize: 8 }}
              >
                Art Marketplace
              </span>
            </div>
          </div>

          {/* ── Search ── */}
          <div
            className="hidden md:flex items-center flex-1 max-w-lg mx-4 h-10 rounded-2xl border overflow-hidden transition-all duration-300 focus-within:shadow-lg"
            style={{
              background: "rgba(255,255,255,0.75)",
              borderColor: "rgba(217,119,6,0.2)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Search size={14} className="ml-3.5 text-stone-300 shrink-0" />
            <input
              placeholder="Search artworks, artists, styles..."
              className="flex-1 bg-transparent outline-none px-3 text-xs text-stone-700 placeholder-stone-300"
              style={{ fontFamily: "'Sora',sans-serif" }}
            />
            <button
              className="h-full px-5 text-xs font-semibold text-amber-50 transition-all duration-200 hover:brightness-110"
              style={{
                background: "linear-gradient(to right, #B45309, #92400E)",
                fontFamily: "'Sora',sans-serif",
              }}
            >
              Search
            </button>
          </div>

          {/* ── Nav links ── */}
          <nav className="hidden lg:flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-amber-50/70 transition-all"
                style={{ fontFamily: "'Sora',sans-serif" }}
              >
                Categories{" "}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
                />
              </button>
              {catOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-52 rounded-2xl py-2 z-50"
                  style={{
                    background: "rgba(255,255,255,0.97)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(217,119,6,0.1)",
                    animation: "fadeIn .15s ease",
                  }}
                >
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    return (
                      <a
                        key={c.name}
                        href="#"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs text-stone-500 hover:text-stone-900 hover:bg-amber-50/60 transition-colors"
                        style={{ fontFamily: "'Sora',sans-serif" }}
                      >
                        <Icon size={14} strokeWidth={1.5} /> {c.name}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
            <a
              href="#"
              className="px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-amber-50/70 transition-all"
              style={{ fontFamily: "'Sora',sans-serif" }}
            >
              Orders
            </a>
          </nav>

          {/* ── Right icon buttons ── */}
          <div className="flex items-center gap-0.5">
            <a
              href="#"
              className="hidden xl:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-50 transition-all duration-300 hover:brightness-110 hover:-translate-y-px hover:shadow-lg"
              style={{
                background: "linear-gradient(to right, #B45309, #92400E)",
                fontFamily: "'Sora',sans-serif",
                boxShadow: "0 4px 12px rgba(180,83,9,0.2)",
              }}
            >
              <Sparkles size={12} /> Become a Seller
            </a>
            <LabeledIconBtn icon={Heart}       label="Wishlist" count={wishCount} to="/wishlist" />
            <LabeledIconBtn icon={Package}     label="Orders" />
            <LabeledIconBtn icon={ShoppingCart} label="Cart"    count={cartCount}  to="/cart" />
            <LabeledIconBtn icon={User}        label="Profile" />
            <button
              className="p-2 rounded-xl hover:bg-amber-50/70 transition-colors lg:hidden"
              onClick={() => setOpen(!open)}
            >
              {open
                ? <X size={20} className="text-stone-600" />
                : <Menu size={20} className="text-stone-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-stone-900/25 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-80 shadow-2xl overflow-y-auto border-l border-amber-100/30"
            style={{
              background: "rgba(250,248,245,0.98)",
              backdropFilter: "blur(20px)",
              animation: "slideRight .25s ease",
            }}
          >
            <div className="p-6 pt-20 flex flex-col gap-1">
              <div
                className="flex items-center rounded-2xl border px-3 py-2.5 mb-4"
                style={{ background: "rgba(255,255,255,0.7)", borderColor: "rgba(217,119,6,0.15)" }}
              >
                <Search size={14} className="text-stone-300 mr-2" />
                <input
                  placeholder="Search..."
                  className="bg-transparent outline-none text-sm flex-1 text-stone-700"
                  style={{ fontFamily: "'Sora',sans-serif" }}
                />
              </div>
              {["Categories", "Orders", "Wishlist", "Cart", "Login / Sign Up", "Become a Seller"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="py-3 px-2 text-sm text-stone-600 border-b border-amber-100/30 last:border-0 hover:text-amber-700 transition-colors"
                    style={{ fontFamily: "'Sora',sans-serif" }}
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
