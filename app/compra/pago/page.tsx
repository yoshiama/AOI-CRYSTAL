'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/components/CheckoutContext';
import { useCart } from '@/components/CartContext';

export default function PagoPage() {
  const router = useRouter();
  const { data, setData } = useCheckout();
  const { items, total, clear } = useCart();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bizumNumber, setBizumNumber] = useState('6XX XXX XXX');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      if (s.bizum_number) setBizumNumber(s.bizum_number);
    });
  }, []);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!data.email) { router.push('/compra/datos'); return null; }

  const finalTotal = total + data.shipping;

  async function handleFile(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setScreenshot(data.url);
  }

  async function handleConfirm() {
    if (!screenshot) { setError('Por favor adjunta la captura del Bizum'); return; }
    setLoading(true);
    setError('');

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: `${data.name} ${data.surname}`,
        customer_email: data.email,
        customer_phone: data.phone,
        customer_address: data.address,
        customer_postal: data.postal,
        items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price, options: i.options })),
        subtotal: total,
        shipping: data.shipping,
        total: finalTotal,
        bizum_screenshot: screenshot,
      }),
    });

    if (res.ok) {
      const orderData = await res.json();
      setData({ orderNumber: orderData.order_number });
      clear();
      router.push('/compra/confirmacion');
    } else {
      setError('Error al procesar el pedido. Inténtalo de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pago por Bizum</h1>
      <div className="space-y-4">
        {/* Bizum instructions */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <h2 className="font-bold text-gray-800 text-lg mb-4">Instrucciones de pago</h2>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-gray-800">Abre tu app de banco</p>
                <p className="text-sm text-gray-500">y busca la opción Bizum</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-gray-800">Envía exactamente</p>
                <div className="mt-1 bg-white rounded-xl px-4 py-2 inline-flex items-center gap-3 shadow-sm border border-purple-100">
                  <span className="text-2xl font-bold text-purple-700">€{finalTotal.toFixed(2)}</span>
                  <span className="text-gray-400">al número</span>
                  <span className="font-bold text-gray-800 text-lg">{bizumNumber}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-gray-800">Haz una captura de pantalla</p>
                <p className="text-sm text-gray-500">del Bizum confirmado y súbela aquí abajo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload screenshot */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Captura del Bizum *</p>
          {screenshot ? (
            <div className="relative">
              <img src={screenshot} alt="Bizum" className="w-full rounded-2xl border border-green-200 max-h-48 object-contain bg-green-50" />
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Subida</div>
              <button onClick={() => setScreenshot(null)} className="mt-2 text-sm text-gray-400 hover:text-red-500">Cambiar captura</button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-300 transition"
              onClick={() => fileRef.current?.click()}
            >
              <div className="text-3xl mb-2">📸</div>
              <p className="text-gray-500 text-sm">Toca aquí para subir la captura del Bizum</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <button
          onClick={handleConfirm}
          disabled={loading || !screenshot}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-2xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : 'Confirmar pedido →'}
        </button>
        <button onClick={() => router.back()} className="w-full py-3 text-sm text-gray-400 hover:text-gray-600">← Volver</button>
      </div>
    </div>
  );
}
