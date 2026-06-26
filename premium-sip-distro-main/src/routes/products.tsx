import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Search, ShoppingCart } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { CATEGORIES, formatNaira } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — EMEEBS Ventures Beverage Catalog" },
      { name: "description", content: "Browse our full beverage catalog: Coca-Cola, Pepsi, Fanta, Sprite, 7UP, Mirinda, bottled water, malt drinks, energy drinks and fruit juices." },
      { property: "og:title", content: "Products — EMEEBS Ventures" },
      { property: "og:description", content: "Premium beverage catalog at wholesale prices." },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: Products,
});

interface ProductData {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  sku?: string;
  description?: string;
  image?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

function Products() {
  const { add } = useCart();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [productSelections, setProductSelections] = useState<
    Record<string, { qty: number }>
  >({});

  useEffect(() => {
    fetchApi("/products")
      .then((data) => {
        setProducts(data);
        // Initialize selections for products
        const initialSelections: any = {};
        data.forEach((p: ProductData) => {
          initialSelections[p._id] = {
            qty: 1
          };
        });
        setProductSelections(initialSelections);
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Failed to load products");
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        (cat === "All" || (p.category && p.category === cat)) &&
        (query === "" || p.name.toLowerCase().includes(query.toLowerCase()))
    );
  }, [cat, query, products]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">Loading products...</div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="gradient-hero text-white py-20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full gradient-gold opacity-20 blur-3xl"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-xs tracking-[0.3em] uppercase text-gold font-semibold mb-3">Catalog</div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold">Our Beverage Range</h1>
          <p className="mt-4 text-white/75 max-w-2xl">Premium brands at competitive wholesale prices. Add to cart and checkout via WhatsApp.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full bg-gray-100 border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", "Soft Drink", "Water", "piece", "plastic"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                    cat === c ? "bg-emerald-600 text-white shadow-card" : "bg-gray-100 text-navy-deep hover:bg-emerald-100"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => {
              const selection = productSelections[p._id];
              if (!selection) return null;
              const unitPrice = p.price;
              const stock = p.quantity;

              return (
                <div key={p._id} className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 border border-gray-200 flex flex-col">
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} loading="lazy" width={800} height={800} className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🍾</div>
                    )}
                    {p.category && (
                      <div className="absolute top-3 left-3 rounded-full bg-navy-deep/90 backdrop-blur text-white text-[10px] uppercase tracking-wider px-3 py-1">
                        {p.category}
                      </div>
                    )}
                    {stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display text-lg font-bold text-navy-deep">{p.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">{p.sku ? `SKU: ${p.sku}` : ''}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-gray-500">
                          per item
                        </div>
                        <div className="font-display text-xl font-bold text-emerald-600">
                          {formatNaira(unitPrice)}
                        </div>
                      </div>
                      <div className="flex items-center bg-gray-100 rounded-full">
                        <button
                          disabled={stock <= 0}
                          onClick={() =>
                            setProductSelections((prev) => ({
                              ...prev,
                              [p._id]: { ...prev[p._id], qty: Math.max(1, prev[p._id].qty - 1) }
                            }))
                          }
                          className="h-8 w-8 grid place-items-center text-navy-deep hover:text-emerald-600 disabled:opacity-30"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{selection.qty}</span>
                        <button
                          disabled={stock <= 0}
                          onClick={() =>
                            setProductSelections((prev) => ({
                              ...prev,
                              [p._id]: { ...prev[p._id], qty: prev[p._id].qty + 1 }
                            }))
                          }
                          className="h-8 w-8 grid place-items-center text-navy-deep hover:text-emerald-600 disabled:opacity-30"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      disabled={stock <= 0 || unitPrice <= 0}
                      onClick={() => {
                        add({
                          productId: p._id,
                          productName: p.name,
                          purchaseType: "Single",
                          size: undefined,
                          qty: selection.qty,
                          unitPrice: unitPrice
                        });
                        toast.success(`${selection.qty} × ${p.name} added to cart`);
                      }}
                      className="mt-4 w-full rounded-full bg-navy-deep text-white py-2.5 text-sm font-semibold hover:bg-navy-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" /> {stock <= 0 ? "Unavailable" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-gray-500">No products match your search.</div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
