import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";
import Header   from "./components/Header";
import Home     from "./pages/Home";
import Cart     from "./pages/Cart";
import Wishlist from "./pages/Wishlist";

// ── Global CSS (keyframes + base resets) kept in app root ──────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  ::selection { background: rgba(180,83,9,0.15); }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(180,83,9,0.2); border-radius: 9px; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideRight {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  @keyframes heroOrb {
    0%, 100% { opacity: 0.12; transform: scale(1) translateY(0); }
    50%       { opacity: 0.22; transform: scale(1.12) translateY(-12px); }
  }
`;

export default function App() {
  return (
    <BrowserRouter>
      {/* ── Google Fonts ── */}
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Sora:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {/* ── Global styles ── */}
      <style>{GLOBAL_CSS}</style>

      {/* ── Global state ── */}
      <StoreProvider>
        <div style={{ background: "#FAF8F5", minHeight: "100vh" }}>
          {/* Header persists across all routes */}
          <Header />

          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/cart"     element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </div>
      </StoreProvider>
    </BrowserRouter>
  );
}
