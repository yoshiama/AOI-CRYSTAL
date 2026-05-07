'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout, calcShipping } from '@/components/CheckoutContext';
import { useCart } from '@/components/CartContext';

export default function DatosPage() {
  const router = useRouter();
  const { data, setData } = useCheckout();
  const { items, total } = useCart();
  const [form, setForm] = useState({ name: data.name, surname: data.surname, email: data.email, phone: data.phone, address: data.address, postal: data.postal });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { zone, shipping } = calcShipping(form.postal, total);
    setData({ ...form, zone, shipping });
    router.push('/compra/envio');
  }

  if (items.length === 0) { router.push('/catalogo'); return null; }

  return (
    <div className="grid md:grid-cols-5 gap-8">
      <div className="md:col-span-3">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tus datos</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['name', 'Nombre', 'Tu nombre'], ['surname', 'Apellidos', 'Tus apellidos']].map(([n, l, p]) => (
              <div key={n}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{l} *</label>
                <input name={n} value={(form as Record<string,string>)[n]} onChange={handleChange} required placeholder={p} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Teléfono *</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="6XX XXX XXX" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Dirección completa *</label>
            <input name="address" value={form.address} onChange={handleChange} required placeholder="Calle, número, piso..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Código postal *</label>
            <input name="postal" value={form.postal} onChange={handleChange} required placeholder="28001" maxLength={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-2xl hover:opacity-90 transition mt-2">
            Continuar →
          </button>
        </form>
      </div>
      <OrderSummary />
    </div>
  );
}

function OrderSummary() {
  const { items, total } = useCart();
  return (
    <div className="md:col-span-2">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-4">
        <h3 className="font-semibold text-gray-800 mb-4">Resumen</h3>
        <div className="space-y-3 mb-4">
          {items.map(item => (
            <div key={item.id} className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.photo ? <img src={item.photo} alt="" className="w-full h-full object-cover" /> : '💎'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">{item.options || `x${item.qty}`}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">€{(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 text-sm text-gray-500">
          <div className="flex justify-between mb-1"><span>Subtotal</span><span>€{total.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Envío</span><span>Se calcula en el siguiente paso</span></div>
        </div>
      </div>
    </div>
  );
}
