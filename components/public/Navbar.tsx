'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import CartDrawer from './CartDrawer';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { count, open, setOpen } = useCart();
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      if (s.logo_url) setLogoUrl(s.logo_url);
    }).catch(() => {});
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src={logoUrl || '/logo.png'}
              alt="AOI Crystal"
              className="h-12 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/catalogo" className="hover:text-purple-600 transition">Catálogo</Link>
            <Link href="/galeria" className="hover:text-purple-600 transition">Galería</Link>
            <Link href="/sobre-nosotras" className="hover:text-purple-600 transition">Sobre nosotras</Link>
            <Link href="/contacto" className="hover:text-purple-600 transition">Contacto</Link>
            <button
              onClick={() => setOpen(true)}
              className="relative flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition"
            >
              🛒
              {count > 0 && (
                <span className="bg-pink-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
      {open && <CartDrawer />}
    </>
  );
}
