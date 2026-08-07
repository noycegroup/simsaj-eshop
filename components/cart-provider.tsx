"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  model: string;
  image: string;
  price: number;
  size: string;
  width: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "key" | "quantity">) => void;
  changeQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "simsaj-working-cart";
const storageVersion = 1;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { version?: number; items?: CartItem[] };
        if (parsed.version === storageVersion && Array.isArray(parsed.items)) {
          queueMicrotask(() => {
            setItems(parsed.items ?? []);
            setStorageLoaded(true);
          });
          return;
        }
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    queueMicrotask(() => setStorageLoaded(true));
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ version: storageVersion, items }));
  }, [items, storageLoaded]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addItem: (item) => setItems((current) => {
      const key = `${item.slug}:${item.size}:${item.width}`;
      const existing = current.find((candidate) => candidate.key === key);
      return existing
        ? current.map((candidate) => candidate.key === key ? { ...candidate, quantity: candidate.quantity + 1 } : candidate)
        : [...current, { ...item, key, quantity: 1 }];
    }),
    changeQuantity: (key, quantity) => setItems((current) => current.map((item) => item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item)),
    removeItem: (key) => setItems((current) => current.filter((item) => item.key !== key)),
    clear: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart musí byť použitý v CartProvider.");
  return value;
}
