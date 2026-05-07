'use client';
import { useCheckout } from '@/components/CheckoutContext';
import Link from 'next/link';

export default function ConfirmacionPage() {
  const { data } = useCheckout();

  return (
    <div className="text-center max-w-md mx-auto py-10">
      <div className="text-7xl mb-5">🎉</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-3">¡Gracias por tu compra!</h1>
      {data.orderNumber && (
        <p className="text-purple-600 font-semibold mb-2">Pedido: {data.orderNumber}</p>
      )}
      <p className="text-gray-500 mb-6">
        Hemos recibido tu pedido y lo estamos preparando con mucho cariño.
        Recibirás un email de confirmación en <strong>{data.email}</strong>.
      </p>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-left space-y-3 mb-8 border border-purple-100">
        <h2 className="font-semibold text-gray-800">¿Qué pasa ahora?</h2>
        <div className="flex gap-3 text-sm text-gray-600">
          <span>1️⃣</span>
          <span>Verificamos tu Bizum (1-2 horas en horario de tienda)</span>
        </div>
        <div className="flex gap-3 text-sm text-gray-600">
          <span>2️⃣</span>
          <span>Recibes un email cuando confirmamos tu pedido</span>
        </div>
        <div className="flex gap-3 text-sm text-gray-600">
          <span>3️⃣</span>
          <span>Preparamos tu pedido con cariño ✨</span>
        </div>
        <div className="flex gap-3 text-sm text-gray-600">
          <span>4️⃣</span>
          <span>Te avisamos cuando lo enviamos</span>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/catalogo" className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-2xl hover:opacity-90 transition">
          Seguir comprando
        </Link>
        <a href="https://instagram.com/aoicrystal" target="_blank" rel="noopener noreferrer" className="block w-full py-3 border-2 border-pink-200 text-pink-500 font-semibold rounded-2xl hover:bg-pink-50 transition">
          📸 Síguenos en @aoicrystal
        </a>
      </div>
    </div>
  );
}
