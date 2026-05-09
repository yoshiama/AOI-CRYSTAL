'use client';
import { useState, useRef, useCallback } from 'react';

interface Product {
  id?: number; name: string; category: string; description: string; price: number;
  photos: string; colors: string; finishes: string; custom_text: string; visible: number;
}

const CATEGORIES = ['llavero', 'pendiente', 'letra', 'paraguas', 'portafoto'];

export default function ProductModal({ product, onClose, onSave }: {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!product?.id;
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'llavero');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [photos, setPhotos] = useState<string[]>(product ? JSON.parse(product.photos || '[]') : []);
  const [colors, setColors] = useState(product ? JSON.parse(product.colors || '[]').join(', ') : '');
  const [finishes, setFinishes] = useState(product ? JSON.parse(product.finishes || '[]').join(', ') : '');
  const [customText, setCustomText] = useState(product?.custom_text || '');
  const [visible, setVisible] = useState(product ? Boolean(product.visible) : true);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    return data.url as string;
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const remaining = 6 - photos.length;
    if (remaining <= 0) return;
    const toUpload = arr.slice(0, remaining);
    const urls = await Promise.all(toUpload.map(uploadFile));
    setPhotos(prev => [...prev, ...urls]);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [photos]);

  function removePhoto(i: number) {
    setPhotos(prev => prev.filter((_, idx) => idx !== i));
  }

  function movePhoto(from: number, to: number) {
    const arr = [...photos];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setPhotos(arr);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      name, category, description, price: parseFloat(price),
      photos,
      colors: colors.split(',').map((s: string) => s.trim()).filter(Boolean),
      finishes: finishes.split(',').map((s: string) => s.trim()).filter(Boolean),
      custom_text: customText,
      visible,
    };
    const url = isEdit ? `/api/products/${product!.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-lg">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {preview ? (
          <div className="p-6">
            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800">{name || 'Nombre del producto'}</h3>
              <p className="text-purple-600 font-semibold mt-1">€{price || '0.00'}</p>
              <p className="text-gray-600 mt-2 text-sm">{description}</p>
              {photos.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {photos.map((url, i) => <img key={i} src={url} alt="" className="w-20 h-20 rounded-xl object-cover" />)}
                </div>
              )}
              <div className="mt-3 text-sm text-gray-500">
                <span className="capitalize font-medium">{category}</span>
                {colors && <span className="ml-2">· Colores: {colors}</span>}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setPreview(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm">← Volver a editar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-50">
                {saving ? 'Guardando...' : 'Publicar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre *</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="Nombre del producto" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Categoría *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Descripción</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" placeholder="Descripción del producto..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Precio (€) *</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Colores (separados por coma)</label>
                <input value={colors} onChange={e => setColors(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="dorado, plateado, rosa" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Acabados</label>
                <input value={finishes} onChange={e => setFinishes(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="brillo, mate" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Texto personalizado (instrucciones)</label>
              <input value={customText} onChange={e => setCustomText(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="Ej: Indica la inicial que quieres en el campo de notas" />
            </div>

            {/* Photo upload */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Fotos (máx. 6)</label>
              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <p className="text-gray-400 text-sm">Subiendo...</p>
                ) : (
                  <p className="text-gray-400 text-sm">Arrastra fotos aquí o haz clic · {photos.length}/6</p>
                )}
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
              </div>
              {photos.length > 0 && (
                <div className="flex gap-3 mt-3 flex-wrap">
                  {photos.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition font-bold"
                        title="Eliminar foto"
                      >✕</button>
                      <div className="flex gap-1 mt-1 justify-center">
                        {i > 0 && <button onClick={() => movePhoto(i, i - 1)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded transition">←</button>}
                        {i < photos.length - 1 && <button onClick={() => movePhoto(i, i + 1)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded transition">→</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} className="w-4 h-4 accent-purple-600" />
                <span className="text-sm text-gray-700">Visible en la web</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={() => setPreview(true)} disabled={!name || !price} className="flex-1 border border-purple-300 text-purple-600 rounded-xl py-2.5 text-sm hover:bg-purple-50 disabled:opacity-40">Previsualizar</button>
              <button onClick={handleSave} disabled={saving || !name || !price} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
