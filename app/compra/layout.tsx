import { CheckoutProvider } from '@/components/CheckoutContext';
import Link from 'next/link';

export default function CompraLayout({ children }: { children: React.ReactNode }) {
  return (
    <CheckoutProvider>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-100 px-6 py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-purple-700">✨ AOI Crystal</Link>
              <Link href="/catalogo" className="text-sm text-gray-400 hover:text-gray-600">← Seguir comprando</Link>
            </div>
          </header>
          {/* Steps */}
          <div className="max-w-2xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
              {['Tus datos', 'Envío', 'Pago', 'Confirmación'].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <div className="w-6 h-px bg-gray-200" />}
                  <span className="font-medium">{step}</span>
                </div>
              ))}
            </div>
            {children}
          </div>
        </div>
    </CheckoutProvider>
  );
}
