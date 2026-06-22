import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/products";
import { WHATSAPP_NUMBER } from "@/components/site/Whatsapp";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — EMEEBS Ventures" },
      { name: "description", content: "Complete your beverage order. Delivery details submitted directly via WhatsApp." },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: Checkout,
});

function Checkout() {
  const { detailed, total, clear } = useCart();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [sending, setSending] = useState(false);

  if (detailed.length === 0) {
    return (
      <SiteLayout>
        <div className="py-24 text-center max-w-md mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-navy-deep">No items to checkout</h1>
          <p className="mt-3 text-muted-foreground">Add products to your cart to place an order.</p>
          <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-full gradient-emerald text-white px-6 py-3 text-sm font-semibold">
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error("Please fill in all delivery details");
      return;
    }
    setSending(true);

    const lines = [
      "*NEW ORDER — EMEEBS VENTURES*",
      "",
      "*Customer Name:*",
      form.name,
      "",
      "*Phone:*",
      form.phone,
      "",
      "*Address:*",
      form.address,
      "",
      "*Items Ordered:*",
      ...detailed.map(({ product, qty }) => `• ${product.name} ${product.unit} × ${qty}  —  ${formatNaira(product.price * qty)}`),
      "",
      `*Grand Total:* ${formatNaira(total)}`,
      "",
      "Please confirm availability and delivery schedule.",
    ];
    const msg = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;

    // Open WhatsApp
    window.open(url, "_blank");
    toast.success("Redirecting to WhatsApp...");
    setTimeout(() => {
      clear();
      nav({ to: "/" });
    }, 1200);
  };

  return (
    <SiteLayout>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10">
            <div className="text-xs tracking-[0.3em] uppercase text-emerald font-semibold mb-2">Step 2 of 2</div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-navy-deep">Checkout</h1>
            <p className="mt-3 text-muted-foreground">Enter your delivery details — we'll send your order to WhatsApp for instant confirmation.</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <form onSubmit={onSubmit} className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8 shadow-card space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy-deep mb-2">Customer Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-deep mb-2">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08161300992"
                  className="w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-deep mb-2">Delivery Address</label>
                <textarea
                  required
                  rows={4}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="House number, street, area, city, state"
                  className="w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald resize-none"
                />
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-emerald/8 border border-emerald/20 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald shrink-0 mt-0.5" />
                <p className="text-sm text-navy">
                  Your order will be sent to our WhatsApp line for instant confirmation. No payment is required on this page.
                </p>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full gradient-emerald text-white py-4 text-sm font-semibold shadow-premium hover:-translate-y-0.5 transition disabled:opacity-60"
              >
                <MessageCircle className="h-4 w-4" />
                Place Order via WhatsApp
              </button>
            </form>

            <aside className="bg-card rounded-2xl border border-border/50 p-6 shadow-card h-fit lg:sticky lg:top-28">
              <h2 className="font-display text-xl font-bold text-navy-deep">Order Summary</h2>
              <ul className="mt-5 space-y-3 max-h-80 overflow-y-auto pr-1">
                {detailed.map(({ product, qty, subtotal }) => (
                  <li key={product.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-semibold text-navy-deep truncate">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.unit} × {qty}</div>
                    </div>
                    <div className="font-semibold shrink-0">{formatNaira(subtotal)}</div>
                  </li>
                ))}
              </ul>
              <div className="my-5 border-t border-border" />
              <div className="flex justify-between items-baseline">
                <span className="font-display text-lg font-bold text-navy-deep">Grand Total</span>
                <span className="font-display text-2xl font-bold text-emerald">{formatNaira(total)}</span>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
