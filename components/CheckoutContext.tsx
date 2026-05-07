'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export interface CheckoutData {
  name: string; surname: string; email: string; phone: string;
  address: string; postal: string; zone: 'peninsular' | 'baleares' | 'canarias';
  shipping: number; orderNumber?: string;
}

interface CheckoutCtx {
  data: CheckoutData;
  setData: (d: Partial<CheckoutData>) => void;
}

const defaultData: CheckoutData = {
  name: '', surname: '', email: '', phone: '', address: '', postal: '',
  zone: 'peninsular', shipping: 3,
};

const CheckoutContext = createContext<CheckoutCtx | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<CheckoutData>(defaultData);
  function setData(d: Partial<CheckoutData>) { setDataState(prev => ({ ...prev, ...d })); }
  return <CheckoutContext.Provider value={{ data, setData }}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be inside CheckoutProvider');
  return ctx;
}

export function calcShipping(postal: string, subtotal: number): { zone: CheckoutData['zone']; shipping: number } {
  const code = parseInt(postal.slice(0, 2));
  if ([35, 38].includes(code)) {
    return { zone: 'canarias', shipping: subtotal >= 25 ? 0 : 6 };
  }
  if ([7].includes(code)) {
    return { zone: 'baleares', shipping: subtotal >= 25 ? 0 : 5 };
  }
  return { zone: 'peninsular', shipping: subtotal >= 15 ? 0 : 3 };
}
