import { useState, useEffect, useRef } from "react";

// ── useScrollReveal hook ───────────────────────────────────────
export function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

// ── Reveal wrapper component ───────────────────────────────────
export function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── SectionHeader ──────────────────────────────────────────────
export function SectionHeader({ tag, title }) {
  return (
    <div className="text-center mb-14">
      <span
        className="font-bold uppercase tracking-[3px] text-amber-600"
        style={{ fontFamily: "'Sora',sans-serif", fontSize: 10 }}
      >
        {tag}
      </span>
      <h2
        className="mt-2 font-bold text-stone-900"
        style={{
          fontFamily: "'Libre Baskerville',serif",
          fontSize: "clamp(1.7rem, 3vw, 2.5rem)",
        }}
      >
        {title}
      </h2>
      <div
        className="mt-4 mx-auto h-px w-16"
        style={{
          background: "linear-gradient(to right, transparent, #D97706, transparent)",
        }}
      />
    </div>
  );
}
