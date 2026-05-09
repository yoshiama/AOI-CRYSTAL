'use client';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { items, remove, updateQty, total, setOpen } = useCart();
  const router = useRouter();

  const shipping = total >= 30 ? 0 : total === 0 ? 0 : 3;
  const finalTotal = total + shipping;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-sm bg-white shadow-2xl flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Tu carrito</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🛒</div>
              <p>Tu carrito está vacío</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
              <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {item.photo ? <img src={item.photo} alt={item.name} className="w-full h-full object-cover" /> : '💎'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">{item.name}</p>
                {item.options && <p className="text-xs text-gray-400">{item.options}</p>}
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-full bg-white border border-gray-200 text-sm font-bold flex items-center justify-center hover:bg-gray-100">−</button>
                    <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-full bg-white border border-gray-200 text-sm font-bold flex items-center justify-center hover:bg-gray-100">+</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-purple-700">€{(item.price * item.qty).toFixed(2)}</span>
                    <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400 text-sm">✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Envío (peninsular)</span>
                <span>{shipping === 0 ? <span className="text-green-600">Gratis 🎉</span> : `€${shipping.toFixed(2)}`}</span>
              </div>
              {total > 0 && total < 30 && (
                <p className="text-xs text-pink-500">A €{(30 - total).toFixed(2)} del envío gratis</p>
              )}
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span><span className="text-purple-700">€{finalTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { setOpen(false); router.push('/compra/datos'); }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
            >
              Finalizar compra →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
