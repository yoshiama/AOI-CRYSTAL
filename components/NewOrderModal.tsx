'use client';
import { useState, useEffect } from 'react';

interface Product { id: number; name: string; price: number; }

export default function NewOrderModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPostal, setCustomerPostal] = useState('');
  const [shipping, setShipping] = useState('0');
  const [items, setItems] = useState<Array<{ productId: number; name: string; price: number; qty: number; options: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);

  function addItem() {
    if (products.length === 0) return;
    const p = products[0];
    setItems(prev => [...prev, { productId: p.id, name: p.name, price: p.price, qty: 1, options: '' }]);
  }

  function updateItem(i: number, field: string, value: string | number) {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item;
      if (field === 'productId') {
        const p = products.find(p => p.id === Number(value));
        return p ? { ...item, productId: p.id, name: p.name, price: p.price } : item;
      }
      return { ...item, [field]: value };
    }));
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + parseFloat(shipping || '0');

  async function handleSave() {
    setSaving(true);
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: customerName, customer_email: customerEmail,
        customer_phone: customerPhone, customer_address: customerAddress,
        customer_postal: customerPostal, items, subtotal, shipping: parseFloat(shipping || '0'), total,
      }),
    });
    setSaving(false);
    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl w-full max-w-xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Nuevo pedido manual</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[['Nombre *', customerName, setCustomerName], ['Email *', customerEmail, setCustomerEmail], ['Teléfono', customerPhone, setCustomerPhone], ['Código postal', customerPostal, setCustomerPostal]].map(([label, val, setter]) => (
              <div key={label as string}>
                <label className="text-xs font-medium text-gray-600 mb-1 block">{label as string}</label>
                <input value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Dirección</label>
            <input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">Productos</label>
              <button onClick={addItem} className="text-xs text-purple-600 hover:underline">+ Añadir</button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', parseInt(e.target.value))} className="w-16 border border-gray-200 rounded-xl px-2 py-1.5 text-sm text-center" />
                <input value={item.options} onChange={e => updateItem(i, 'options', e.target.value)} placeholder="Opciones" className="flex-1 border border-gray-200 rounded-xl px-2 py-1.5 text-sm" />
                <button onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 px-1">✕</button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-600">Gastos de envío (€)</label>
            <input type="number" step="0.01" value={shipping} onChange={e => setShipping(e.target.value)} className="w-24 border border-gray-200 rounded-xl px-3 py-1.5 text-sm" />
            <span className="ml-auto font-bold text-purple-700">Total: €{total.toFixed(2)}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={saving || !customerName || !customerEmail} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50">
              {saving ? 'Creando...' : 'Crear pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
