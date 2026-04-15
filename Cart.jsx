import { useStore } from "../context/StoreContext";
import { fmt, PRODUCTS } from "../data/mockData";
import { ShoppingCart, Trash2 } from "lucide-react";

// Flatten all products into one lookup map for cart display
const ALL_PRODUCTS = Object.values(PRODUCTS).flat().reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

export default function Cart() {
  const { cartItems, toggleCart } = useStore();

  return (
    <div style={{ marginTop: 90, minHeight: "60vh", background: "#FAF8F5" }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1
          className="text-3xl font-bold text-stone-900 mb-8"
          style={{ fontFamily: "'Libre Baskerville',serif" }}
        >
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-stone-400">
            <ShoppingCart size={48} strokeWidth={1.2} />
            <p style={{ fontFamily: "'Sora',sans-serif" }}>Your cart is empty.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {cartItems.map(({ id, quantity }) => {
              const product = ALL_PRODUCTS[id];
              if (!product) return null;
              return (
                <li
                  key={id}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(217,119,6,0.08)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <img
                    src={product.img}
                    alt={product.title}
                    className="w-20 h-24 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1">
                    <p
                      className="text-[10px] uppercase tracking-widest text-stone-400 mb-0.5"
                      style={{ fontFamily: "'Sora',sans-serif" }}
                    >
                      {product.artist}
                    </p>
                    <h3
                      className="text-sm font-semibold text-stone-800 mb-1"
                      style={{ fontFamily: "'Libre Baskerville',serif" }}
                    >
                      {product.title}
                    </h3>
                    <p
                      className="text-base font-bold text-amber-700"
                      style={{ fontFamily: "'Libre Baskerville',serif" }}
                    >
                      {fmt(product.price)}
                    </p>
                    <p
                      className="text-xs text-stone-400 mt-1"
                      style={{ fontFamily: "'Sora',sans-serif" }}
                    >
                      Qty: {quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleCart(id)}
                    className="p-2 rounded-xl hover:bg-red-50 transition-colors"
                    aria-label="Remove from cart"
                  >
                    <Trash2 size={16} className="text-stone-400 hover:text-red-500 transition-colors" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
