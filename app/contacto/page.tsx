'use client';
import { useState } from 'react';
import PublicLayout from '@/components/public/PublicLayout';

export default function ContactoPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/tienda/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">💌</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Contacto</h1>
          <p className="text-gray-400">¿Tienes alguna pregunta o quieres un pedido especial? Escríbenos</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Contacta con nosotras</h3>
              <div className="space-y-3 text-sm">
                <a href="mailto:aoicrystalor@gmail.com" className="flex items-center gap-3 text-purple-700 hover:underline">
                  <span className="text-xl">📧</span> aoicrystalor@gmail.com
                </a>
                <a href="https://instagram.com/aoicrystal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-pink-600 hover:underline">
                  <span className="text-xl">📸</span> @aoicrystal
                </a>
              </div>
            </div>
            <div className="bg-pink-50 rounded-2xl p-5 text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-1">⏰ Tiempo de respuesta</p>
              <p>Respondemos en menos de 24 horas en días laborables</p>
            </div>
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center text-center bg-green-50 rounded-2xl p-8">
              <div className="text-5xl mb-3">✉️</div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">¡Mensaje enviado!</h3>
              <p className="text-gray-500 text-sm">Te contestaremos lo antes posible. ¡Gracias!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="tu@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Mensaje *</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" placeholder="¿En qué podemos ayudarte?" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
