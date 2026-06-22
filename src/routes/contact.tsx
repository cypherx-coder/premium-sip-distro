import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { WHATSAPP_NUMBER } from "@/components/site/Whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact EMEEBS Ventures — Wholesale Beverage Enquiries" },
      { name: "description", content: "Contact EMEEBS Ventures for wholesale beverage supply. Call 08161300992, WhatsApp, or email adenikeaderogba083@gmail.com. Located in Kuje, Abuja." },
      { property: "og:title", content: "Contact EMEEBS Ventures" },
      { property: "og:description", content: "Get in touch for wholesale beverage enquiries and corporate supply." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

const FAQS = [
  { q: "Do you supply outside Abuja?", a: "Yes. We deliver nationwide across Nigeria via our trusted logistics partners. Lead times depend on destination — confirmed at order." },
  { q: "What is your minimum order quantity?", a: "We supply both small retailers and large institutions. There is no strict minimum for retail, but bulk pricing kicks in from 10 crates." },
  { q: "Do you handle corporate accounts and events?", a: "Absolutely. We have dedicated account managers for hotels, restaurants, supermarkets, corporate offices and event planners." },
  { q: "How do I pay for my order?", a: "We accept bank transfer, POS on delivery, and approved corporate invoicing. Payment details are confirmed when you place your order." },
  { q: "Are all your products genuine?", a: "Yes. EMEEBS Ventures only stocks 100% genuine products sourced directly from authorized distributors and manufacturers." },
];

function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `*Enquiry from website*\n\nName: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    toast.success("Message ready in WhatsApp — just hit send!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <SiteLayout>
      <section className="gradient-hero text-white py-20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full gradient-gold opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-xs tracking-[0.3em] uppercase text-gold font-semibold mb-3">Contact</div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold">Let's talk supply.</h1>
          <p className="mt-4 max-w-2xl text-white/75 text-lg">Our wholesale and corporate team is ready to help. Reach us through any channel below.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Phone, label: "Call Us", value: "08161300992", href: "tel:08161300992" },
            { icon: MessageCircle, label: "WhatsApp", value: "08161300992", href: `https://wa.me/${WHATSAPP_NUMBER}` },
            { icon: Mail, label: "Email", value: "adenikeaderogba083@gmail.com", href: "mailto:adenikeaderogba083@gmail.com" },
            { icon: MapPin, label: "Visit Us", value: "Shadadi, Kuje, Abuja", href: "#map" },
          ].map((c) => (
            <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
               className="group rounded-2xl bg-card border border-border/50 p-6 shadow-card hover:shadow-premium hover:-translate-y-1 transition-all">
              <div className="h-12 w-12 rounded-xl gradient-emerald grid place-items-center mb-4">
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
              <div className="mt-1 font-semibold text-navy-deep break-words text-sm">{c.value}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-10">
          <form onSubmit={send} className="bg-card rounded-2xl border border-border/50 p-7 sm:p-9 shadow-card">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-deep">Send us a message</h2>
            <p className="text-sm text-muted-foreground mt-2">Fill the form — we'll continue the conversation on WhatsApp.</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-deep mb-2">Your Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-deep mb-2">Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-deep mb-2">Message</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald resize-none" />
              </div>
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-full gradient-emerald text-white py-3.5 text-sm font-semibold shadow-card hover:-translate-y-0.5 transition">
                <Send className="h-4 w-4" /> Send Message
              </button>
            </div>
          </form>

          <div id="map" className="rounded-2xl overflow-hidden border border-border/50 shadow-card min-h-[420px]">
            <iframe
              title="EMEEBS Ventures location"
              src="https://www.google.com/maps?q=Kuje,Abuja,Nigeria&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[420px] border-0"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="text-xs tracking-[0.3em] uppercase text-emerald font-semibold mb-3">FAQ</div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-navy-deep">Common Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left p-5 hover:bg-secondary/40 transition"
                >
                  <span className="font-display font-bold text-navy-deep">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 text-emerald shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-muted-foreground leading-relaxed animate-fade-up">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
