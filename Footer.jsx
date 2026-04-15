import { Gem, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { NOISE_URI } from "../data/mockData";

const FOOTER_COLS = [
  { title: "Company", links: ["About Us", "Careers", "Press", "Blog"] },
  { title: "Support", links: ["Contact Us", "FAQ", "Help Center", "Track Order"] },
  { title: "Sell",    links: ["Become a Seller", "Seller Guide", "Dashboard", "Commission"] },
  { title: "Legal",   links: ["Terms & Conditions", "Privacy Policy", "Refund Policy", "Cookie Policy"] },
];

export default function Footer() {
  return (
    <footer className="relative" style={{ background: "linear-gradient(to bottom, #1C1917, #0F0E0D)" }}>
      {/* Noise */}
      <div
        className="absolute inset-0 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: NOISE_URI, backgroundSize: "180px", opacity: 0.04 }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(217,119,6,0.15)",
                  border: "1px solid rgba(252,211,77,0.1)",
                }}
              >
                <Gem size={14} color="#FCD34D" />
              </div>
              <span
                className="font-bold text-base text-stone-100"
                style={{ fontFamily: "'Libre Baskerville',serif" }}
              >
                Artisan Hub
              </span>
            </div>
            <p
              className="text-xs leading-relaxed mb-6 max-w-[180px]"
              style={{ color: "rgba(250,248,245,0.3)", fontFamily: "'Sora',sans-serif", lineHeight: 1.7 }}
            >
              India's premier marketplace for original artwork. Connecting artists and collectors since
              2024.
            </p>
            <div className="flex gap-2">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Icon size={13} color="rgba(250,248,245,0.35)" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4
                className="font-bold uppercase mb-4"
                style={{
                  color: "rgba(252,211,77,0.7)",
                  fontFamily: "'Sora',sans-serif",
                  fontSize: 10,
                  letterSpacing: "2.5px",
                }}
              >
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs transition-colors duration-200 hover:text-stone-200"
                      style={{ color: "rgba(250,248,245,0.3)", fontFamily: "'Sora',sans-serif" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p style={{ color: "rgba(250,248,245,0.18)", fontFamily: "'Sora',sans-serif", fontSize: 10 }}>
            © 2026 Artisan Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {["Visa", "Mastercard", "UPI", "RuPay", "Paytm"].map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  color: "rgba(250,248,245,0.2)",
                  fontFamily: "'Sora',sans-serif",
                  fontSize: 9,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
