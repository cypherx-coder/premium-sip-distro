import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="gradient-hero text-white mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-xl gradient-emerald grid place-items-center shadow-gold">
              <span className="font-display text-primary-foreground text-xl font-bold">E</span>
            </div>
            <div>
              <div className="font-display font-bold text-lg">EMEEBS VENTURES</div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-white/60">Beverage Distribution</div>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Nigeria's trusted partner for wholesale and retail beverage distribution — serving homes, hotels, restaurants, supermarkets and corporate organizations.
          </p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 rounded-full glass grid place-items-center hover:bg-white/20 transition" aria-label="Social">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-gold mb-5">Explore</h4>
          <ul className="space-y-3 text-white/75 text-sm">
            <li><Link to="/" className="hover:text-emerald-light transition">Home</Link></li>
            <li><Link to="/products" className="hover:text-emerald-light transition">Products</Link></li>
            <li><Link to="/about" className="hover:text-emerald-light transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-light transition">Contact</Link></li>
            <li><Link to="/cart" className="hover:text-emerald-light transition">Your Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-gold mb-5">Categories</h4>
          <ul className="space-y-3 text-white/75 text-sm">
            <li>Soft Drinks</li>
            <li>Bottled Water</li>
            <li>Energy Drinks</li>
            <li>Malt Drinks</li>
            <li>Fruit Juices</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-gold mb-5">Get in Touch</h4>
          <ul className="space-y-3 text-white/80 text-sm">
            <li className="flex items-start gap-3"><Phone className="h-4 w-4 mt-0.5 text-emerald-light shrink-0" /><span>08161300992</span></li>
            <li className="flex items-start gap-3"><Mail className="h-4 w-4 mt-0.5 text-emerald-light shrink-0" /><a href="mailto:adenikeaderogba083@gmail.com" className="hover:text-emerald-light transition break-all">adenikeaderogba083@gmail.com</a></li>
            <li className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5 text-emerald-light shrink-0" /><span>Shadadi, Kuje, Abuja, Nigeria</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {new Date().getFullYear()} EMEEBS Ventures. All rights reserved.</p>
          <p>Trusted Beverage Distribution Partner</p>
        </div>
      </div>
    </footer>
  );
}
