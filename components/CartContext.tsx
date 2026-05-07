'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  qty: number;
  options: string;
  photo: string;
}

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, 'id'>) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aoi-cart');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('aoi-cart', JSON.stringify(items));
  }, [items]);

  function add(item: Omit<CartItem, 'id'>) {
    const id = `${item.productId}-${item.options}-${Date.now()}`;
    setItems(prev => [...prev, { ...item, id }]);
    setOpen(true);
  }

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty < 1) { remove(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }

  function clear() { setItems([]); }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
