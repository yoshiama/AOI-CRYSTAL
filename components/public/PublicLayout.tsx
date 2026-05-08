import { getDb } from '@/lib/db';
import Navbar from './Navbar';

function getSetting(key: string, fallback: string): string {
  try {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row?.value || fallback;
  } catch { return fallback; }
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const email = getSetting('contact_email', 'aoicrystalor@gmail.com');
  const instagram = getSetting('contact_instagram', 'aoicrystal');
  const shopName = getSetting('shop_name', 'AOI Crystal');

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
