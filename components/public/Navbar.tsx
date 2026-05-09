'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import CartDrawer from './CartDrawer';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { count, open, setOpen } = useCart();
  const [logoUrl, setLogoUrl] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      if (s.logo_url) setLogoUrl(s.logo_url);
    }).catch(() => {});
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const links = [
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/galeria', label: 'Galería' },
    { href: '/sobre-nosotras', label: 'Sobre nosotras' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src={logoUrl || '/logo.png'}
              alt="AOI Crystal"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="hover:text-purple-600 transition">{l.label}</Link>
            ))}
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

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="relative flex items-center bg-purple-600 text-white px-3 py-2 rounded-full hover:bg-purple-700 transition"
            >
              🛒
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl hover:bg-purple-50 transition text-gray-600 text-xl"
              aria-label="Menú"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-purple-100 bg-white px-4 py-3 space-y-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
      {open && <CartDrawer />}
    </>
  );
}
