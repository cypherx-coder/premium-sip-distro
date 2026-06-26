import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, BadgeCheck, Building2, Check, Hotel, Quote, ShieldCheck, Star, Store, Truck, Users, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { SiteLayout } from "@/components/site/Layout";
import { CATEGORIES, PRODUCTS, formatNaira } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EMEEBS Ventures — Premium Beverage Distribution in Nigeria" },
      { name: "description", content: "Wholesale & retail beverages — Coca-Cola, Pepsi, water, malt, energy drinks & juices. Fast nationwide delivery to homes, hotels, supermarkets, restaurants & offices." },
      { property: "og:title", content: "EMEEBS Ventures — Premium Beverage Distribution" },
      { property: "og:description", content: "Trusted national beverage supplier. 10,000+ orders delivered." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function useCountUp(target: number, duration = 1800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function Stat({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const v = useCountUp(value);
  return (
    <div className="text-center">
      <div className="font-display text-4xl sm:text-5xl font-bold text-gradient-gold">
        {v.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-sm text-white/70 tracking-wide uppercase">{label}</div>
    </div>
  );
}

function Home() {
  const { add } = useCart();
  const featured = PRODUCTS.slice(0, 6);

  return (
    <SiteLayout transparentNav>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <img
          src={heroImg}
          alt="Premium beverage distribution"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-32 pb-20 w-full">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
              <Award className="h-4 w-4 text-gold" />
              <span className="text-xs sm:text-sm text-white/90 font-medium tracking-wide">Nigeria's Trusted Beverage Distributor</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05]">
              Premium Beverages,<br />
              <span className="text-gradient-gold">Delivered at Scale.</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed">
              Wholesale and retail distribution of genuine beverages to homes, hotels, restaurants, supermarkets, offices and event planners — backed by reliable nationwide logistics.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-full gradient-emerald text-white px-7 py-4 text-sm font-semibold shadow-premium hover:-translate-y-0.5 transition-all"
              >
                Browse Products
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full glass text-white px-7 py-4 text-sm font-semibold hover:bg-white/20 transition"
              >
                Request a Quote
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 max-w-4xl glass rounded-3xl p-8 shadow-premium">
            <Stat value={10000} suffix="+" label="Orders Delivered" />
            <Stat value={500} suffix="+" label="Business Clients" />
            <Stat value={99} suffix="%" label="Customer Satisfaction" />
            <Stat value={24} suffix="h" label="Fast Delivery" />
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block text-xs tracking-[0.3em] uppercase text-emerald font-semibold mb-4">About EMEEBS</div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-navy-deep leading-tight">
              Your trusted partner in beverage distribution.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
              EMEEBS Ventures is a leading wholesale and retail beverage distribution company supplying genuine products to organizations and homes across Nigeria. We combine deep industry expertise with a relentless commitment to service.
            </p>
            <ul className="mt-7 space-y-3">
              {["Authorized national distributor","Cold-chain ready logistics","Bulk pricing for businesses","Dedicated account management"].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-5 rounded-full gradient-emerald grid place-items-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  <span className="text-navy">{t}</span>
                </li>
              ))}
            </ul>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-emerald font-semibold hover:gap-3 transition-all">
              Learn more about us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 gradient-emerald rounded-3xl blur-2xl opacity-20" />
            <div className="relative rounded-3xl overflow-hidden shadow-premium aspect-[4/5]">
              <img src={heroImg} alt="Beverage warehouse" loading="lazy" width={800} height={1000} className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 right-6 glass-light rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl gradient-gold grid place-items-center">
                    <Award className="h-6 w-6 text-navy-deep" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-navy-deep">15+ Years</div>
                    <div className="text-xs text-muted-foreground">Distribution Excellence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs tracking-[0.3em] uppercase text-emerald font-semibold mb-3">Our Portfolio</div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-navy-deep">Featured Categories</h2>
            <p className="mt-4 text-muted-foreground">Premium brands across every beverage category your business needs.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {CATEGORIES.map((c, i) => (
              <Link
                key={c.name}
                to="/products"
                className="group relative rounded-2xl bg-card p-7 shadow-card hover:-translate-y-2 hover:shadow-premium transition-all duration-300 border border-border/50"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 gradient-emerald rounded-t-2xl scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                <div className="text-5xl mb-4">{c.icon}</div>
                <h3 className="font-display text-xl font-bold text-navy-deep">{c.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                <ArrowRight className="mt-4 h-4 w-4 text-emerald opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-emerald font-semibold mb-3">Best Sellers</div>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-navy-deep">Popular Products</h2>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 text-emerald font-semibold hover:gap-3 transition-all">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <div key={p.id} className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 border border-border/50">
                <div className="relative aspect-square bg-gradient-to-br from-secondary to-background overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" width={800} height={800} className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 rounded-full bg-navy-deep/90 backdrop-blur text-white text-[10px] uppercase tracking-wider px-3 py-1">{p.category}</div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold text-navy-deep">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">per {p.unit}</div>
                      <div className="font-display text-xl font-bold text-emerald">{formatNaira(p.price)}</div>
                    </div>
                    <Link
                      to="/products"
                      className="rounded-full bg-navy-deep text-white px-4 py-2.5 text-sm font-semibold hover:bg-navy transition"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs tracking-[0.3em] uppercase text-gold font-semibold mb-3">Why EMEEBS</div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold">Built on Trust, Powered by Service</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "100% Genuine Products", desc: "Direct from authorized manufacturers — never repackaged or counterfeit." },
              { icon: BadgeCheck, title: "Wholesale Pricing", desc: "Competitive bulk rates that protect your margins and grow your business." },
              { icon: Truck, title: "Reliable Delivery", desc: "Same-day & next-day dispatch across Abuja and nationwide logistics." },
              { icon: Building2, title: "Massive Inventory", desc: "Thousands of crates in stock — we never let you run out." },
              { icon: Users, title: "Dedicated Service", desc: "Account managers who know your business and respond instantly." },
              { icon: Star, title: "Premium Brands", desc: "The full range of Nigeria's most loved beverage brands under one roof." },
            ].map((f) => (
              <div key={f.title} className="glass rounded-2xl p-7 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
                <div className="h-12 w-12 rounded-xl gradient-gold grid place-items-center mb-5">
                  <f.icon className="h-6 w-6 text-navy-deep" />
                </div>
                <h3 className="font-display text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-white/75 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs tracking-[0.3em] uppercase text-emerald font-semibold mb-3">Client Voices</div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-navy-deep">Trusted by Industry Leaders</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Mrs. Adaeze O.", role: "Procurement, GoldenLeaf Hotel", text: "EMEEBS has been our supplier for three years. Timely deliveries, fair pricing, and absolutely zero stockouts." },
              { name: "Mr. Tunde A.", role: "Owner, BigMart Supermarket", text: "Their wholesale rates and reliability have been a game-changer for our store. Highly professional team." },
              { name: "Chef Bola K.", role: "Events Caterer, Abuja", text: "For every event we plan, EMEEBS is on speed-dial. They show up — every single time, on time." },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl bg-card border border-border/50 p-8 shadow-card hover:shadow-premium transition">
                <Quote className="h-8 w-8 text-emerald/30 mb-4" />
                <p className="text-navy leading-relaxed">"{t.text}"</p>
                <div className="mt-6 flex items-center gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="font-semibold text-navy-deep">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-20 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="text-xs tracking-[0.3em] uppercase text-emerald font-semibold mb-3">Our Clients</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-deep">Proudly serving 500+ businesses</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: Store, label: "Retailers" },
              { icon: Building2, label: "Supermarkets" },
              { icon: Hotel, label: "Hotels & Resorts" },
              { icon: Utensils, label: "Restaurants" },
              { icon: Users, label: "Corporate Offices" },
            ].map((p) => (
              <div key={p.label} className="rounded-2xl bg-card border border-border/50 p-6 text-center hover:border-emerald hover:-translate-y-1 transition-all">
                <p.icon className="h-8 w-8 mx-auto text-navy-deep" />
                <div className="mt-3 text-sm font-semibold text-navy-deep">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden gradient-hero p-10 sm:p-14 shadow-premium">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full gradient-gold opacity-30 blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-display text-2xl sm:text-4xl font-bold text-white">Get wholesale price updates.</h3>
                <p className="mt-3 text-white/75">Join our newsletter for monthly bulk deals and seasonal offers.</p>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed — welcome to EMEEBS!"); (e.target as HTMLFormElement).reset(); }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  required
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-full bg-white/95 px-5 py-3.5 text-sm text-navy-deep placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-emerald"
                />
                <button className="rounded-full gradient-emerald text-white px-7 py-3.5 text-sm font-semibold hover:-translate-y-0.5 transition">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
