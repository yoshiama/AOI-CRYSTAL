'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { useCart } from '@/components/CartContext';

interface Product {
  id: number; name: string; category: string; price: number; photos: string;
  description: string; colors: string; finishes: string; custom_text: string;
  product_type: string;
}

const INICIAL_COLORS = [
  { value: 'blanco', label: 'Blanco', hex: '#ffffff', border: true },
  { value: 'transparente', label: 'Transparente', hex: 'transparent', border: true },
  { value: 'rosa', label: 'Rosa', hex: '#f9a8d4' },
  { value: 'fucsia', label: 'Fucsia', hex: '#ec4899' },
  { value: 'rojo', label: 'Rojo', hex: '#ef4444' },
  { value: 'burdeos', label: 'Burdeos', hex: '#7f1d1d' },
  { value: 'naranja', label: 'Naranja', hex: '#fb923c' },
  { value: 'amarillo', label: 'Amarillo', hex: '#fde047' },
  { value: 'verde', label: 'Verde', hex: '#4ade80' },
  { value: 'verde oscuro', label: 'Verde oscuro', hex: '#14532d' },
  { value: 'azul', label: 'Azul', hex: '#60a5fa' },
  { value: 'azul marino', label: 'Azul marino', hex: '#1e3a8a' },
  { value: 'morado', label: 'Morado', hex: '#a855f7' },
  { value: 'morado oscuro', label: 'Morado oscuro', hex: '#4c1d95' },
  { value: 'negro', label: 'Negro', hex: '#1f2937' },
  { value: 'plateado', label: 'Plateado', hex: 'linear-gradient(135deg, #e8e8e8, #a0a0a0, #e8e8e8)' },
  { value: 'dorado', label: 'Dorado', hex: 'linear-gradient(135deg, #ffd700, #b8860b, #ffd700)' },
];

function InicialSelector({ index, letra, color, onLetra, onColor }: {
  index: number;
  letra: string;
  color: string;
  onLetra: (v: string) => void;
  onColor: (v: string) => void;
}) {
  const ordinals = ['Primera', 'Segunda', 'Tercera'];
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-700">{ordinals[index]} inicial</p>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Letra</label>
        <input
          value={letra}
          onChange={e => onLetra(e.target.value.toUpperCase().slice(0, 1))}
          maxLength={1}
          placeholder="A"
          className="w-16 h-12 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 uppercase bg-white"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Color de la inicial</label>
        <div className="flex gap-2 flex-wrap">
          {INICIAL_COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => onColor(c.value)}
              title={c.label}
              className={`w-8 h-8 rounded-full transition-all ${color === c.value ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' : 'hover:scale-105'} ${c.border ? 'border border-gray-300' : ''}`}
              style={{
                background: c.value === 'transparente'
                  ? 'repeating-linear-gradient(45deg, #e5e7eb 0, #e5e7eb 3px, white 3px, white 6px)'
                  : c.value === 'plateado'
                  ? 'linear-gradient(135deg, #e8e8e8, #a0a0a0, #e8e8e8)'
                  : c.value === 'dorado'
                  ? 'linear-gradient(135deg, #ffd700, #b8860b, #ffd700)'
                  : c.hex,
              }}
            />
          ))}
        </div>
        {color && (
          <p className="text-xs text-gray-500 mt-1.5 capitalize">Seleccionado: <span className="font-medium text-purple-700">{color}</span></p>
        )}
      </div>
    </div>
  );
}

export default function ProductoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [color, setColor] = useState('');
  const [finish, setFinish] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [added, setAdded] = useState(false);

  // Iniciales state
  const [numIniciales, setNumIniciales] = useState(1);
  const [iniciales, setIniciales] = useState([
    { letra: '', color: 'rosa' },
    { letra: '', color: 'morado' },
    { letra: '', color: 'azul' },
  ]);

  useEffect(() => {
    fetch(`/api/tienda/products/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { router.push('/catalogo'); return; }
        setProduct(data.product);
        setRelated(data.related);
        const colors = JSON.parse(data.product.colors || '[]');
        const finishes = JSON.parse(data.product.finishes || '[]');
        if (colors.length > 0) setColor(colors[0]);
        if (finishes.length > 0) setFinish(finishes[0]);
      });
  }, [id]);

  if (!product) return (
    <PublicLayout>
      <div className="flex items-center justify-center py-32 text-gray-400">Cargando...</div>
    </PublicLayout>
  );

  const photos = JSON.parse(product.photos || '[]');
  const colors = JSON.parse(product.colors || '[]');
  const finishes = JSON.parse(product.finishes || '[]');
  const isIniciales = product.product_type === 'iniciales';

  function buildOptions() {
    if (isIniciales) {
      const parts = iniciales.slice(0, numIniciales).map(i => {
        const letra = i.letra || '?';
        return `${letra} (${i.color})`;
      });
      return parts.join(' · ');
    }
    const parts = [];
    if (color) parts.push(`Color: ${color}`);
    if (finish) parts.push(`Acabado: ${finish}`);
    if (customNote) parts.push(customNote);
    return parts.join(' · ');
  }

  function canAdd() {
    if (isIniciales) {
      return iniciales.slice(0, numIniciales).every(i => i.letra.trim() !== '');
    }
    return true;
  }

  function handleAdd() {
    add({
      productId: product!.id,
      name: product!.name,
      price: product!.price,
      qty: 1,
      options: buildOptions(),
      photo: photos[0] || '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function updateInicial(i: number, field: 'letra' | 'color', value: string) {
    setIniciales(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/catalogo" className="text-sm text-gray-400 hover:text-purple-600 mb-6 inline-block">← Volver al catálogo</Link>
        <div className="grid md:grid-cols-2 gap-10">
          {/* Photos */}
          <div>
            <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden relative">
              {photos.length > 0 ? (
                <img src={photos[photoIdx]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">💎</div>
              )}
              {photos.length > 1 && (
                <>
                  <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-white transition">‹</button>
                  <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-white transition">›</button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_: string, i: number) => (
                      <button key={i} onClick={() => setPhotoIdx(i)} className={`w-2 h-2 rounded-full transition ${i === photoIdx ? 'bg-purple-600' : 'bg-white/60'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 mt-3">
                {photos.map((url: string, i: number) => (
                  <button key={i} onClick={() => setPhotoIdx(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition ${i === photoIdx ? 'border-purple-500' : 'border-transparent'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-400 capitalize mb-1">{product.category}</p>
              <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
              <p className="text-3xl font-bold text-purple-600 mt-2">€{product.price.toFixed(2)}</p>
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* INICIALES special UI */}
            {isIniciales ? (
              <div className="space-y-4">
                {/* Number selector */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Número de iniciales</p>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(n => (
                      <button
                        key={n}
                        onClick={() => setNumIniciales(n)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                          numIniciales === n
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {n} {n === 1 ? 'inicial' : 'iniciales'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inicial selectors */}
                <div className="space-y-3">
                  {Array.from({ length: numIniciales }).map((_, i) => (
                    <InicialSelector
                      key={i}
                      index={i}
                      letra={iniciales[i].letra}
                      color={iniciales[i].color}
                      onLetra={v => updateInicial(i, 'letra', v)}
                      onColor={v => updateInicial(i, 'color', v)}
                    />
                  ))}
                </div>

                {/* Preview */}
                {iniciales.slice(0, numIniciales).some(i => i.letra) && (
                  <div className="bg-purple-50 rounded-xl p-3 text-sm">
                    <span className="text-gray-500">Tu llavero: </span>
                    <span className="font-semibold text-purple-700">
                      {iniciales.slice(0, numIniciales).map(i => `${i.letra || '?'} (${i.color})`).join(' · ')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {colors.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Color</p>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map((c: string) => (
                        <button key={c} onClick={() => setColor(c)} className={`px-4 py-1.5 rounded-full text-sm border-2 capitalize transition ${color === c ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                )}

                {finishes.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Acabado</p>
                    <div className="flex gap-2 flex-wrap">
                      {finishes.map((f: string) => (
                        <button key={f} onClick={() => setFinish(f)} className={`px-4 py-1.5 rounded-full text-sm border-2 capitalize transition ${finish === f ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                )}

                {product.custom_text && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Personalización</p>
                    <p className="text-xs text-gray-400 mb-1">{product.custom_text}</p>
                    <textarea
                      value={customNote}
                      onChange={e => setCustomNote(e.target.value)}
                      rows={2}
                      placeholder="Escribe aquí tu personalización..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                    />
                  </div>
                )}
              </>
            )}

            <button
              onClick={handleAdd}
              disabled={!canAdd()}
              className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : canAdd()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {added ? '✓ Añadido al carrito' : isIniciales && !canAdd() ? 'Escribe todas las iniciales' : 'Añadir al carrito'}
            </button>

            <div className="bg-purple-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
              <p>🚚 Envío gratuito desde €30 (peninsular)</p>
              <p>💜 Hecho a mano con mucho cariño</p>
              <p>✨ Personalizado especialmente para ti</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">También te puede gustar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map(p => {
                const photos = JSON.parse(p.photos || '[]');
                return (
                  <Link key={p.id} href={`/producto/${p.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all">
                    <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
                      {photos[0] ? <img src={photos[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <span className="text-4xl">💎</span>}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-gray-800">{p.name}</p>
                      <p className="text-purple-600 font-bold text-sm mt-1">€{p.price.toFixed(2)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
