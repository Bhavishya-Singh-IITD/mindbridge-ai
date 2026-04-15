import { Heart } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { fmt, PRODUCTS } from "../data/mockData";
import ProductCard from "../components/ProductCard";

// Flatten all products into one lookup map
const ALL_PRODUCTS = Object.values(PRODUCTS).flat().reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

export default function Wishlist() {
  const { wished, toggleWish, toggleCart, isInCart, isWished } = useStore();

  const wishedProducts = [...wished].map((id) => ALL_PRODUCTS[id]).filter(Boolean);

  return (
    <div style={{ marginTop: 90, minHeight: "60vh", background: "#FAF8F5" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1
          className="text-3xl font-bold text-stone-900 mb-8"
          style={{ fontFamily: "'Libre Baskerville',serif" }}
        >
          Your Wishlist
        </h1>

        {wishedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-stone-400">
            <Heart size={48} strokeWidth={1.2} />
            <p style={{ fontFamily: "'Sora',sans-serif" }}>
              No saved artworks yet. Heart a piece to save it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {wishedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wished={isWished(product.id)}
                onWish={toggleWish}
                onCart={toggleCart}
                inCart={isInCart(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
