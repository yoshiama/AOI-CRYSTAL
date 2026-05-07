import Navbar from './Navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="font-semibold text-purple-600">✨ AOI Crystal</div>
          <div className="flex gap-6">
            <a href="mailto:aoicrystalor@gmail.com" className="hover:text-purple-600">aoicrystalor@gmail.com</a>
            <a href="https://instagram.com/aoicrystal" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">@aoicrystal</a>
          </div>
          <div>© {new Date().getFullYear()} AOI Crystal</div>
        </div>
      </footer>
    </div>
  );
}
