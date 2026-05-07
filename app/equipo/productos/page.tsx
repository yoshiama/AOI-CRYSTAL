'use client';
import { useEffect, useState } from 'react';
import PanelLayout from '@/components/PanelLayout';
import ProductModal from '@/components/ProductModal';

interface Product {
  id: number; name: string; category: string; description: string; price: number;
  photos: string; colors: string; finishes: string; custom_text: string; visible: number;
}

const CATEGORIES = ['llavero', 'pendiente', 'letra', 'paraguas', 'portafoto'];

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch('/api/products');
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }

  async function toggleVisible(product: Product) {
    await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, photos: JSON.parse(product.photos), colors: JSON.parse(product.colors), finishes: JSON.parse(product.finishes), visible: !product.visible }),
    });
    fetchProducts();
  }

  async function deleteProduct(id: number) {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    fetchProducts();
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <PanelLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-56"
            />
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            + Añadir producto
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Foto</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Categoría</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Precio</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin productos</td></tr>
              ) : filtered.map(p => {
                const photos = JSON.parse(p.photos || '[]');
                return (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      {photos[0] ? (
                        <img src={photos[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-lg">💎</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 font-medium">€{p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleVisible(p)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${p.visible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {p.visible ? '👁️ Visible' : '🙈 Oculto'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditProduct(p); setShowModal(true); }}
                          className="text-purple-600 hover:text-purple-800 text-xs font-medium px-2 py-1 rounded-lg hover:bg-purple-50"
                        >Editar</button>
                        <button
                          onClick={() => setConfirmDelete(p.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50"
                        >Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm modal */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-semibold text-gray-800 text-lg mb-2">¿Estás segura?</h3>
            <p className="text-gray-500 text-sm mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={() => deleteProduct(confirmDelete)} className="flex-1 bg-red-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-red-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchProducts(); }}
        />
      )}
    </PanelLayout>
  );
}
