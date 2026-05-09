'use client';
import { useState, useEffect, useRef } from 'react';

interface GalleryItem {
  id: number;
  filename: string;
  caption: string;
  sort_order: number;
  created_at: number;
}

export default function GaleriaAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const r = await fetch('/api/gallery');
    setItems(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('caption', caption);
    await fetch('/api/gallery', { method: 'POST', body: fd });
    setCaption('');
    if (fileRef.current) fileRef.current.value = '';
    await load();
    setUploading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta foto de la galería?')) return;
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  }

  async function saveCaption(id: number) {
    await fetch(`/api/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: editCaption }),
    });
    setItems(items.map(i => i.id === id ? { ...i, caption: editCaption } : i));
    setEditingId(null);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Galería de ejemplos</h1>
        <p className="text-gray-400 text-sm">Las fotos aparecerán en la web pública como inspiración para los clientes</p>
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="font-semibold text-gray-700 mb-4">Añadir foto</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Foto *</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Texto / caption (opcional)</label>
            <input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Ej: Llavero personalizado con flores y purpurina"
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="self-start bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 text-sm"
          >
            {uploading ? 'Subiendo...' : '+ Añadir foto'}
          </button>
        </div>
      </form>

      {/* Gallery grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-5xl mb-3">🖼️</div>
          <p>Aún no hay fotos en la galería</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-gray-50 overflow-hidden">
                <img
                  src={`/api/gallery/photo/${item.filename}`}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                {editingId === item.id ? (
                  <div className="flex gap-2">
                    <input
                      value={editCaption}
                      onChange={e => setEditCaption(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300"
                      autoFocus
                    />
                    <button onClick={() => saveCaption(item.id)} className="text-xs bg-purple-600 text-white px-2 py-1 rounded-lg">✓</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 px-1">✕</button>
                  </div>
                ) : (
                  <p
                    className="text-xs text-gray-500 cursor-pointer hover:text-purple-600 min-h-[1rem]"
                    onClick={() => { setEditingId(item.id); setEditCaption(item.caption); }}
                    title="Clic para editar"
                  >
                    {item.caption || <span className="italic text-gray-300">Sin texto — clic para añadir</span>}
                  </p>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="mt-2 text-xs text-red-400 hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
