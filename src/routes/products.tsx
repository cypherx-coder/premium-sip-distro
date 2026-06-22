import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { CATEGORIES, PRODUCTS, formatNaira } from "@/lib/products";
import { useCart } from "@/lib/cart";

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

function Products() {
  const { add } = useCart();
  const [cat, setCat] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const filtered = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          (query === "" || p.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [cat, query],
  );

  const getQty = (id: string) => qtys[id] ?? 1;
  const setQ = (id: string, v: number) => setQtys((p) => ({ ...p, [id]: Math.max(1, v) }));

  return (
    <SiteLayout>
      <section className="gradient-hero text-white py-20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full gradient-gold opacity-20 blur-3xl" />
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full bg-secondary pl-11 pr-5 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", ...CATEGORIES.map((c) => c.name)].map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                    cat === c ? "gradient-emerald text-white shadow-card" : "bg-secondary text-navy-deep hover:bg-emerald/10"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => {
              const qty = getQty(p.id);
              return (
                <div key={p.id} className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 border border-border/50 flex flex-col">
                  <div className="relative aspect-square bg-gradient-to-br from-secondary to-background overflow-hidden">
                    <img src={p.image} alt={p.name} loading="lazy" width={800} height={800} className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 rounded-full bg-navy-deep/90 backdrop-blur text-white text-[10px] uppercase tracking-wider px-3 py-1">{p.category}</div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display text-lg font-bold text-navy-deep">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">{p.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-muted-foreground">per {p.unit}</div>
                        <div className="font-display text-xl font-bold text-emerald">{formatNaira(p.price)}</div>
                      </div>
                      <div className="flex items-center bg-secondary rounded-full">
                        <button onClick={() => setQ(p.id, qty - 1)} className="h-8 w-8 grid place-items-center text-navy-deep hover:text-emerald" aria-label="Decrease">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                        <button onClick={() => setQ(p.id, qty + 1)} className="h-8 w-8 grid place-items-center text-navy-deep hover:text-emerald" aria-label="Increase">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => { add(p.id, qty); toast.success(`${qty} × ${p.name} added to cart`); }}
                      className="mt-4 w-full rounded-full bg-navy-deep text-white py-2.5 text-sm font-semibold hover:bg-navy transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">No products match your search.</div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
