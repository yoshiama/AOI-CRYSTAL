'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';

interface Product {
  id: number; name: string; category: string; price: number; photos: string; description: string;
}

const CATEGORIES = [
  { value: 'todos', label: 'Todos' },
  { value: 'llavero', label: 'Llaveros' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'letra', label: 'Letras' },
  { value: 'paraguas', label: 'Paraguas' },
  { value: 'portafoto', label: 'Portafotos' },
];

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = category !== 'todos' ? `?category=${category}` : '';
    fetch(`/api/tienda/products${params}`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); });
  }, [category]);

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Catálogo</h1>
          <p className="text-gray-400">Accesorios de resina artesanos, hechos a mano</p>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 justify-center flex-wrap mb-10">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                category === c.value
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >{c.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No hay productos en esta categoría aún ✨</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => {
              const photos = JSON.parse(p.photos || '[]');
              return (
                <Link
                  key={p.id}
                  href={`/producto/${p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center overflow-hidden relative">
                    {photos[0] ? (
                      <img src={photos[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-5xl">💎</span>
                    )}
                    {photos.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-1.5 py-0.5 rounded-full">{photos.length} fotos</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{p.name}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{p.category}</p>
                    <p className="text-purple-600 font-bold mt-2 text-base">€{p.price.toFixed(2)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
