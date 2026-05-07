import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function Home() {
  const db = getDb();
  const featured = db.prepare('SELECT * FROM products WHERE visible = 1 ORDER BY created_at DESC LIMIT 4').all() as Array<{
    id: number; name: string; category: string; price: number; photos: string; description: string;
  }>;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-5">✨</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4 leading-tight">AOI Crystal</h1>
          <p className="text-2xl text-purple-500 font-medium mb-3">Accesorios de resina artesanos</p>
          <p className="text-gray-500 mb-8 text-lg">Piezas únicas hechas a mano con mucho cariño, personalizadas para ti.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/catalogo" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition text-lg">
              Ver catálogo
            </Link>
            <Link href="/sobre-nosotras" className="border-2 border-purple-200 text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-50 transition text-lg">
              Sobre nosotras
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Productos destacados</h2>
          <p className="text-gray-400">Cada pieza, única y hecha con amor</p>
        </div>
        {featured.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Catálogo en preparación ✨</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map(p => {
              const photos = JSON.parse(p.photos || '[]');
              return (
                <Link key={p.id} href={`/producto/${p.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
                    {photos[0] ? (
                      <img src={photos[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-5xl">💎</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{p.category}</p>
                    <p className="text-purple-600 font-bold mt-2">€{p.price.toFixed(2)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <div className="text-center mt-8">
          <Link href="/catalogo" className="text-purple-600 font-medium hover:underline">Ver todos los productos →</Link>
        </div>
      </section>

      {/* About snippet */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="text-8xl flex-shrink-0">🌸</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Sobre nosotras</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              En AOI Crystal somos dos personas con mucho cariño y ganas de crear algo bonito juntas. Cada accesorio puede ser completamente tuyo — dinos cómo lo imaginas y nosotras lo haremos realidad.
            </p>
            <Link href="/sobre-nosotras" className="text-purple-600 font-medium hover:underline">Conoce nuestra historia →</Link>
          </div>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-12 px-6 text-center">
        <p className="text-gray-500 mb-3">¿Nos sigues en Instagram?</p>
        <a
          href="https://instagram.com/aoicrystal"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
        >
          📸 @aoicrystal
        </a>
      </section>
    </PublicLayout>
  );
}
