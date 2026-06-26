import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = { 
  id: string; // productId-purchaseType-size (e.g., "abc123-Single-50cl")
  productId: string;
  productName: string;
  purchaseType: 'Single' | 'Pack' | 'Crate' | 'Carton';
  size?: string;
  qty: number;
  unitPrice: number;
};
type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, 'id'>) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  detailed: { item: CartItem; subtotal: number }[];
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "emeebs-cart-v1";

function generateCartItemId(productId: string, purchaseType: string, size?: string) {
  return size ? `${productId}-${purchaseType}-${size}` : `${productId}-${purchaseType}`;
}

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

  const add: CartCtx["add"] = (newItem) => {
    const id = generateCartItemId(newItem.productId, newItem.purchaseType, newItem.size);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, qty: i.qty + newItem.qty } : i
        );
      }
      return [...prev, { ...newItem, id }];
    });
  };
  
  const remove: CartCtx["remove"] = (id) => setItems((p) => p.filter((i) => i.id !== id));
  const setQty: CartCtx["setQty"] = (id, qty) =>
    setItems((p) => (qty <= 0 ? p.filter((i) => i.id !== id) : p.map((i) => (i.id === id ? { ...i, qty } : i))));
  const clear = () => setItems([]);

  const detailed = items.map((item) => ({
    item,
    subtotal: item.unitPrice * item.qty
  }));

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
