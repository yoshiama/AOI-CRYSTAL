'use client';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/components/CheckoutContext';
import { useCart } from '@/components/CartContext';

const ZONE_LABELS = { peninsular: 'España Peninsular', baleares: 'Baleares', canarias: 'Canarias' };
const ZONE_RULES = {
  peninsular: '3€ · Gratis desde €15',
  baleares: '5€ · Gratis desde €25',
  canarias: '6€ · Gratis desde €25',
};

export default function EnvioPage() {
  const router = useRouter();
  const { data } = useCheckout();
  const { total } = useCart();

  if (!data.email) { router.push('/compra/datos'); return null; }

  const finalTotal = total + data.shipping;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Información de envío</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="font-semibold text-purple-800">{ZONE_LABELS[data.zone]}</p>
          <p className="text-sm text-purple-600 mt-0.5">{ZONE_RULES[data.zone]}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Destinatario</span><span className="font-medium">{data.name} {data.surname}</span></div>
          <div className="flex justify-between text-gray-600"><span>Dirección</span><span className="font-medium text-right max-w-xs">{data.address}</span></div>
          <div className="flex justify-between text-gray-600"><span>CP</span><span className="font-medium">{data.postal}</span></div>
        </div>
        <div className="border-t border-gray-100 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>€{total.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500">
            <span>Envío ({ZONE_LABELS[data.zone]})</span>
            <span>{data.shipping === 0 ? <span className="text-green-600 font-medium">Gratis 🎉</span> : `€${data.shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-base text-gray-800 pt-1">
            <span>Total</span><span className="text-purple-700">€{finalTotal.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={() => router.push('/compra/pago')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-2xl hover:opacity-90 transition">
          Continuar al pago →
        </button>
        <button onClick={() => router.back()} className="w-full py-3 text-sm text-gray-400 hover:text-gray-600">← Volver</button>
      </div>
    </div>
  );
}
