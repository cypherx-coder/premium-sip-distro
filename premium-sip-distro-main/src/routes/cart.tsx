import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — EMEEBS Ventures" },
      { name: "description", content: "Review your beverage order and proceed to WhatsApp checkout." },
      { property: "og:url", content: "/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: Cart,
});

function Cart() {
  const { detailed, total, setQty, remove, clear } = useCart();

  return (
    <SiteLayout>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10">
            <div className="text-xs tracking-[0.3em] uppercase text-emerald font-semibold mb-2">Step 1 of 2</div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-navy-deep">Your Cart</h1>
          </div>

          {detailed.length === 0 ? (
            <div className="rounded-3xl bg-secondary/40 p-16 text-center">
              <div className="h-20 w-20 rounded-full bg-card mx-auto grid place-items-center shadow-card">
                <ShoppingBag className="h-9 w-9 text-emerald" />
              </div>
              <h2 className="font-display text-2xl font-bold text-navy-deep mt-6">Your cart is empty</h2>
              <p className="text-muted-foreground mt-2">Browse our catalog and add your favourite beverages.</p>
              <Link to="/products" className="mt-7 inline-flex items-center gap-2 rounded-full gradient-emerald text-white px-7 py-3.5 text-sm font-semibold shadow-card hover:-translate-y-0.5 transition">
                Shop Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
              <div className="space-y-4">
                {detailed.map(({ item, subtotal }) => (
                  <div key={item.id} className="bg-card rounded-2xl border border-border/50 p-5 shadow-card flex flex-col sm:flex-row gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display text-lg font-bold text-navy-deep truncate">{item.productName}</h3>
                          <div className="text-sm text-muted-foreground">
                            {item.purchaseType}
                            {item.size ? ` • ${item.size}` : ''}
                             • {formatNaira(item.unitPrice)} each
                          </div>
                        </div>
                        <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive shrink-0" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center bg-secondary rounded-full">
                          <button onClick={() => setQty(item.id, item.qty - 1)} className="h-9 w-9 grid place-items-center text-navy-deep hover:text-emerald" aria-label="Decrease">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.qty}</span>
                          <button onClick={() => setQty(item.id, item.qty + 1)} className="h-9 w-9 grid place-items-center text-navy-deep hover:text-emerald" aria-label="Increase">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="font-display text-xl font-bold text-navy-deep">{formatNaira(subtotal)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={clear} className="text-sm text-muted-foreground hover:text-destructive">Clear cart</button>
              </div>

              <aside className="bg-card rounded-2xl border border-border/50 p-6 shadow-card h-fit lg:sticky lg:top-28">
                <h2 className="font-display text-xl font-bold text-navy-deep">Order Summary</h2>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>{formatNaira(total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span><span>Confirmed at checkout</span>
                  </div>
                </div>
                <div className="my-5 border-t border-border" />
                <div className="flex justify-between items-baseline">
                  <span className="font-display text-lg font-bold text-navy-deep">Total</span>
                  <span className="font-display text-2xl font-bold text-emerald">{formatNaira(total)}</span>
                </div>
                <Link to="/checkout" className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full gradient-emerald text-white py-3.5 text-sm font-semibold shadow-card hover:-translate-y-0.5 transition">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/products" className="mt-3 w-full inline-flex items-center justify-center rounded-full bg-secondary text-navy-deep py-3 text-sm font-semibold hover:bg-secondary/70 transition">
                  Continue Shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
