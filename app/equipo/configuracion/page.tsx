'use client';
import { useEffect, useState } from 'react';
import PanelLayout from '@/components/PanelLayout';

type Settings = Record<string, string>;

type Field = { key: string; label: string; type: 'text' | 'textarea'; rows?: number };

const SECTIONS: { title: string; icon: string; fields: Field[] }[] = [
  {
    title: 'Sobre nosotras',
    icon: '🌸',
    fields: [
      { key: 'sobre_nosotras_intro', label: 'Texto principal (cita destacada)', type: 'textarea', rows: 4 },
      { key: 'sobre_nosotras_cta', label: 'Texto secundario', type: 'textarea', rows: 3 },
    ],
  },
  {
    title: 'Pagos',
    icon: '💸',
    fields: [
      { key: 'bizum_number', label: 'Número de Bizum', type: 'text' },
    ],
  },
  {
    title: 'Contacto y redes',
    icon: '📬',
    fields: [
      { key: 'contact_email', label: 'Email de contacto', type: 'text' },
      { key: 'contact_instagram', label: 'Usuario de Instagram (sin @)', type: 'text' },
      { key: 'shop_name', label: 'Nombre de la tienda', type: 'text' },
    ],
  },
  {
    title: 'Gastos de envío',
    icon: '📦',
    fields: [
      { key: 'shipping_peninsular', label: 'Peninsular (€)', type: 'text' },
      { key: 'shipping_baleares', label: 'Baleares (€)', type: 'text' },
      { key: 'shipping_canarias', label: 'Canarias (€)', type: 'text' },
      { key: 'free_shipping_threshold', label: 'Envío gratis a partir de (€)', type: 'text' },
    ],
  },
];

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { setSettings(data); setLoading(false); });
  }, []);

  function update(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  async function saveSection(keys: string[]) {
    setSaving(true);
    const payload: Settings = {};
    for (const k of keys) payload[k] = settings[k] ?? '';
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(keys[0]);
    setTimeout(() => setSaved(null), 2000);
  }

  if (loading) return <PanelLayout><div className="text-gray-400 text-sm">Cargando...</div></PanelLayout>;

  return (
    <PanelLayout>
      <div className="max-w-2xl space-y-6">
        <p className="text-gray-500 text-sm">Edita aquí el contenido que aparece en la tienda pública.</p>

        {SECTIONS.map(section => (
          <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>{section.icon}</span> {section.title}
            </h2>

            {section.fields.map(field => (
              <div key={field.key}>
                <label className="text-sm font-medium text-gray-600 mb-1 block">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={settings[field.key] ?? ''}
                    onChange={e => update(field.key, e.target.value)}
                    rows={field.rows ?? 3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={settings[field.key] ?? ''}
                    onChange={e => update(field.key, e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                )}
              </div>
            ))}

            <div className="flex items-center gap-3">
              <button
                onClick={() => saveSection(section.fields.map(f => f.key))}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              {saved && section.fields.some(f => f.key === saved) && (
                <span className="text-green-600 text-sm">✓ Guardado</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </PanelLayout>
  );
}
