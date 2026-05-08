import { getDb } from '@/lib/db';
import PublicLayout from '@/components/public/PublicLayout';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getSetting(key: string, fallback: string): string {
  try {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

export default function SobreNosotrasPage() {
  const intro = getSetting('sobre_nosotras_intro', 'En AOI Crystal somos dos personas con mucho cariño y ganas de crear algo bonito juntas.');
  const cta = getSetting('sobre_nosotras_cta', 'Pero lo que más nos gusta es que cada accesorio puede ser completamente tuyo.');
  const instagram = getSetting('contact_instagram', 'aoicrystal');

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Sobre nosotras</h1>
          <p className="text-purple-500 text-lg">Tres personas, mucho cariño y mucha resina</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 mb-10 border border-purple-100">
            <p className="text-gray-700 leading-relaxed text-lg italic">
              &ldquo;{intro}&rdquo;
            </p>
          </div>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>{cta}</p>
            <p>
              Porque en AOI Crystal no vendemos accesorios, <strong className="text-purple-700">creamos piezas hechas solo para ti</strong>.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: '✋', title: 'Hecho a mano', desc: 'Cada pieza la creamos nosotras, con tiempo y dedicación' },
            { icon: '🎨', title: 'Personalizado', desc: 'Elige colores, acabados y personalización al detalle' },
            { icon: '💌', title: 'Con amor', desc: 'Cada pedido se prepara con mucho cariño especialmente para ti' },
          ].map(item => (
            <div key={item.title} className="text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-500">¿Quieres conocer más sobre nuestro trabajo?</p>
          <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition">
            📸 Síguenos en Instagram
          </a>
          <div>
            <Link href="/catalogo" className="text-purple-600 font-medium hover:underline">Ver nuestros productos →</Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
