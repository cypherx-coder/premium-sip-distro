import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Eye, Heart, Sparkles, Target, Truck } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EMEEBS Ventures — Our Story & Mission" },
      { name: "description", content: "Learn about EMEEBS Ventures — a trusted Nigerian beverage distribution partner serving thousands of homes, hotels, supermarkets and corporate clients." },
      { property: "og:title", content: "About EMEEBS Ventures" },
      { property: "og:description", content: "Our story, mission and commitment to distribution excellence." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="gradient-hero text-white py-24 relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full gradient-gold opacity-15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-xs tracking-[0.3em] uppercase text-gold font-semibold mb-3">About Us</div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold max-w-3xl leading-tight">
            Distributing trust, one bottle at a time.
          </h1>
          <p className="mt-6 max-w-2xl text-white/80 text-lg">
            EMEEBS Ventures is a premier wholesale and retail beverage distribution company built on integrity, reliability and service excellence.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="absolute -inset-4 gradient-emerald rounded-3xl blur-2xl opacity-20" />
            <img src={heroImg} alt="Our warehouse" loading="lazy" width={900} height={600} className="relative rounded-3xl shadow-premium w-full" />
          </div>
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-emerald font-semibold mb-3">Company Overview</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-deep leading-tight">
              A trusted name in Nigeria's beverage supply chain.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              From a single delivery van to a full-scale distribution operation, EMEEBS Ventures has grown by relentlessly prioritising our customers. We supply the full range of leading Nigerian beverage brands to retailers, supermarkets, hotels, restaurants, event planners, corporate offices and homes — backed by reliable logistics and dedicated account management.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every order we fulfil is a commitment kept — to genuine products, fair pricing and on-time delivery, every single time.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "Our Mission", text: "To be Nigeria's most dependable beverage distribution partner — making genuine products accessible at fair prices, with logistics our customers can plan around." },
            { icon: Eye, title: "Our Vision", text: "A future where every retailer, hotel, restaurant and household across Nigeria experiences world-class beverage supply, anywhere and anytime." },
            { icon: Heart, title: "Our Values", text: "Integrity, reliability and customer obsession. We treat every order as a relationship — not a transaction." },
          ].map((c) => (
            <div key={c.title} className="bg-card rounded-2xl border border-border/50 p-8 shadow-card">
              <div className="h-12 w-12 rounded-xl gradient-emerald grid place-items-center mb-5">
                <c.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-navy-deep">{c.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs tracking-[0.3em] uppercase text-emerald font-semibold mb-3">What We Stand For</div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-navy-deep">Distribution excellence, by design.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: "Commitment to Quality", desc: "Only genuine products, sourced directly from authorized channels." },
              { icon: Sparkles, title: "Customer Satisfaction", desc: "Every interaction is built to exceed expectations." },
              { icon: Truck, title: "Reliable Logistics", desc: "Nationwide fleet ensuring on-time delivery every order." },
              { icon: Target, title: "Operational Discipline", desc: "Inventory, fulfilment and service tracked to enterprise standards." },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl p-6 bg-card border border-border/50 hover:border-emerald hover:-translate-y-1 transition-all">
                <c.icon className="h-8 w-8 text-emerald" />
                <h3 className="mt-4 font-display text-lg font-bold text-navy-deep">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl gradient-hero p-10 sm:p-14 text-center shadow-premium">
            <h3 className="font-display text-3xl sm:text-4xl font-bold text-white">Ready to partner with EMEEBS?</h3>
            <p className="mt-3 text-white/75">Talk to our wholesale team about your supply needs today.</p>
            <Link to="/contact" className="mt-7 inline-flex items-center gap-2 rounded-full gradient-emerald text-white px-7 py-4 text-sm font-semibold shadow-card hover:-translate-y-0.5 transition">
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
