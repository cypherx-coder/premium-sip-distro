import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "./products";

export type CartItem = { id: string; qty: number };
type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  detailed: { product: Product; qty: number; subtotal: number }[];
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "emeebs-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: CartCtx["add"] = (id, qty = 1) =>
    setItems((p) => {
      const e = p.find((i) => i.id === id);
      if (e) return p.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
      return [...p, { id, qty }];
    });
  const remove: CartCtx["remove"] = (id) => setItems((p) => p.filter((i) => i.id !== id));
  const setQty: CartCtx["setQty"] = (id, qty) =>
    setItems((p) => (qty <= 0 ? p.filter((i) => i.id !== id) : p.map((i) => (i.id === id ? { ...i, qty } : i))));
  const clear = () => setItems([]);

  const detailed = items
    .map((i) => {
      const product = PRODUCTS.find((p) => p.id === i.id);
      if (!product) return null;
      return { product, qty: i.qty, subtotal: product.price * i.qty };
    })
    .filter(Boolean) as { product: Product; qty: number; subtotal: number }[];

  const total = detailed.reduce((s, d) => s + d.subtotal, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider value={{ items, count, total, add, remove, setQty, clear, detailed }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
