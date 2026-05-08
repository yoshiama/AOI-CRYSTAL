'use client';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState('aoicrystalor@gmail.com');
  const [instagram, setInstagram] = useState('aoicrystal');
  const [shopName, setShopName] = useState('AOI Crystal');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      if (s.contact_email) setEmail(s.contact_email);
      if (s.contact_instagram) setInstagram(s.contact_instagram);
      if (s.shop_name) setShopName(s.shop_name);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="font-semibold text-purple-600">✨ {shopName}</div>
          <div className="flex gap-6">
            <a href={`mailto:${email}`} className="hover:text-purple-600">{email}</a>
            <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">@{instagram}</a>
          </div>
          <div>© {new Date().getFullYear()} {shopName}</div>
        </div>
      </footer>
    </div>
  );
}
