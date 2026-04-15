import { createContext, useContext, useState } from "react";

// ── Context creation ───────────────────────────────────────────
const StoreContext = createContext(null);

// ── Custom hook for consuming the context ─────────────────────
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────
export function StoreProvider({ children }) {
  // Cart: array of objects — [{ id, quantity }, ...]
  const [cartItems, setCartItems] = useState([]);

  // Wishlist: Set of product IDs
  const [wished, setWished] = useState(new Set());

  // ── Cart helpers ─────────────────────────────────────────────
  const toggleCart = (id) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === id);
      if (exists) {
        // Second click → remove
        return prev.filter((item) => item.id !== id);
      }
      // First click → add with quantity 1
      return [...prev, { id, quantity: 1 }];
    });
  };

  const isInCart = (id) => cartItems.some((item) => item.id === id);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ── Wishlist helpers ─────────────────────────────────────────
  const toggleWish = (id) => {
    setWished((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isWished = (id) => wished.has(id);

  const wishCount = wished.size;

  // ── Exposed value ────────────────────────────────────────────
  const value = {
    cartItems,
    toggleCart,
    isInCart,
    cartCount,
    wished,
    toggleWish,
    isWished,
    wishCount,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
