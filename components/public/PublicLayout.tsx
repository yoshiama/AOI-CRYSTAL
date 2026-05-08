import Navbar from './Navbar';

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/settings`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {}
  return {};
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const email = s.contact_email || 'aoicrystalor@gmail.com';
  const instagram = s.contact_instagram || 'aoicrystal';
  const shopName = s.shop_name || 'AOI Crystal';

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
