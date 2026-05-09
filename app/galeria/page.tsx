import PublicLayout from '@/components/public/PublicLayout';

export const dynamic = 'force-dynamic';

async function getGallery() {
  try {
    const { getDb } = await import('@/lib/db');
    const db = getDb();
    return db.prepare('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC').all() as Array<{
      id: number; filename: string; caption: string;
    }>;
  } catch {
    return [];
  }
}

export default async function GaleriaPage() {
  const items = await getGallery();

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🖼️</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Galería</h1>
          <p className="text-gray-400 text-lg">Algunos ejemplos de nuestras piezas. Cada una, única y hecha a mano.</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-lg">Galería en preparación</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {items.map(item => (
              <div key={item.id} className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <img
                  src={`/api/gallery/photo/${item.filename}`}
                  alt={item.caption || 'Ejemplo AOI Crystal'}
                  className="w-full object-cover"
                />
                {item.caption && (
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-500 text-center">{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10">
          <p className="text-gray-600 text-lg mb-2">¿Te gusta lo que ves?</p>
          <p className="text-gray-500 mb-6 text-sm">Cuéntanos qué tienes en mente y nosotras lo hacemos realidad</p>
          <a
            href="/contacto"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition"
          >
            Pedir pieza personalizada
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}
