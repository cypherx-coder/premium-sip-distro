import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X, User as UserIcon, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-light shadow-card py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="h-10 w-10 rounded-xl gradient-emerald grid place-items-center shadow-gold">
            <span className="font-display text-primary-foreground text-lg font-bold">E</span>
          </div>
          <div className="leading-tight">
            <div className={`font-display font-bold text-base sm:text-lg ${scrolled ? "text-navy-deep" : "text-white"}`}>
              EMEEBS
            </div>
            <div className={`text-[10px] tracking-[0.2em] uppercase ${scrolled ? "text-muted-foreground" : "text-white/70"}`}>
              Ventures
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-emerald/10 hover:text-emerald ${
                scrolled ? "text-navy-deep" : "text-white"
              }`}
              activeProps={{ className: "bg-emerald/15 text-emerald" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Link
              to={user.role === 'Admin' ? '/admin' : '/dashboard'}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-emerald/10 hover:text-emerald ${
                scrolled ? "text-navy-deep" : "text-white"
              }`}
              activeProps={{ className: "bg-emerald/15 text-emerald" }}
            >
              {user.role === 'Admin' ? 'Admin Panel' : 'My Dashboard'}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <Link
              to={user.role === 'Admin' ? '/admin/profile' : '/dashboard'}
              className="flex items-center gap-2"
            >
              <div className="h-10 w-10 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-5 w-5 text-navy-deep" />
                )}
              </div>
              <div className="hidden md:block">
                <div className={`text-sm font-semibold ${scrolled ? "text-navy-deep" : "text-white"}`}>{user.name}</div>
                <div className={`text-xs ${scrolled ? "text-muted-foreground" : "text-white/70"}`}>{user.role}</div>
              </div>
            </Link>
          )}
          {!user ? (
            <Link
              to="/login"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                scrolled ? "bg-secondary text-navy-deep" : "glass text-white"
              }`}
            >
              Login
            </Link>
          ) : (
            <button
              onClick={logout}
              className={`p-2.5 rounded-full transition-all ${
                scrolled ? "bg-secondary text-navy-deep" : "glass text-white"
              }`}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
          
          <Link
            to="/cart"
            className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
              scrolled
                ? "bg-navy-deep text-primary-foreground hover:bg-navy"
                : "glass text-white hover:bg-white/20"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full gradient-gold text-navy-deep text-[11px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className={`lg:hidden grid place-items-center h-10 w-10 rounded-full ${
              scrolled ? "bg-secondary text-navy-deep" : "glass text-white"
            }`}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden mx-4 mt-3 rounded-2xl glass-light shadow-card p-3 animate-fade-up">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-navy-deep hover:bg-emerald/10"
              activeProps={{ className: "bg-emerald/15 text-emerald" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
