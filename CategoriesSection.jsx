import { CATEGORIES, NOISE_URI } from "../data/mockData";
import { Reveal, SectionHeader } from "./SharedUI";

export default function CategoriesSection() {
  return (
    <section
      className="relative py-20 px-6"
      style={{ background: "linear-gradient(to bottom, #FAF8F5, #FDF8F0, #FAF6ED)" }}
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: NOISE_URI, backgroundSize: "180px", opacity: 0.025 }}
      />

      <div className="relative max-w-7xl mx-auto">
        <Reveal>
          <SectionHeader tag="Explore" title="Browse by Category" />
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Reveal key={cat.name} delay={i * 50}>
                <button
                  className="group relative flex flex-col items-center gap-2.5 py-5 px-2 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 w-full"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(217,119,6,0.1)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(180,83,9,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                  }}
                >
                  {/* Hover background image */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <img src={cat.img} alt="" className="w-full h-full object-cover" />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to top, rgba(28,25,23,0.85), rgba(28,25,23,0.4))",
                      }}
                    />
                  </div>

                  {/* Icon */}
                  <div
                    className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, rgba(254,243,199,0.9), rgba(253,230,138,0.4))",
                      border: "1px solid rgba(217,119,6,0.2)",
                    }}
                  >
                    <Icon
                      size={21}
                      className="text-amber-700 group-hover:text-amber-300 transition-colors duration-300"
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className="relative z-10 text-xs font-medium text-stone-500 group-hover:text-white transition-colors duration-300"
                    style={{ fontFamily: "'Sora',sans-serif" }}
                  >
                    {cat.name}
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
