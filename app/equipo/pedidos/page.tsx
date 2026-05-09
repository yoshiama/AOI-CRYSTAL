'use client';
import { useEffect, useState, useRef } from 'react';
import PanelLayout from '@/components/PanelLayout';
import OrderDetail from '@/components/OrderDetail';
import NewOrderModal from '@/components/NewOrderModal';

interface Order {
  id: number; order_number: string; customer_name: string; customer_email: string;
  customer_phone: string; customer_address: string; customer_postal: string;
  items: string; subtotal: number; shipping: number; total: number; status: string;
  bizum_screenshot: string; internal_notes: string; material_cost: number; created_at: number;
}

const STATUS_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  confirmado: 'bg-blue-100 text-blue-700',
  enviado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('todos');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteValues, setNoteValues] = useState<Record<number, string>>({});
  const noteRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { fetchOrders(); }, [status, search]);

  useEffect(() => {
    if (editingNote !== null && noteRef.current) noteRef.current.focus();
  }, [editingNote]);

  async function fetchOrders() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'todos') params.set('status', status);
    if (search) params.set('search', search);
    const res = await fetch(`/api/orders?${params}`);
    if (res.ok) {
      const data: Order[] = await res.json();
      setOrders(data);
      const notes: Record<number, string> = {};
      for (const o of data) notes[o.id] = o.internal_notes || '';
      setNoteValues(notes);
    }
    setLoading(false);
  }

  async function saveNote(id: number) {
    const value = noteValues[id] ?? '';
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internal_notes: value }),
    });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, internal_notes: value } : o));
    setEditingNote(null);
  }

  return (
    <PanelLayout>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por nombre o nº pedido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-full sm:w-56"
            />
            <div className="flex gap-1 flex-wrap">
              {['todos', 'pendiente', 'confirmado', 'enviado', 'cancelado'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition ${
                    status === s ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition w-full sm:w-auto"
          >+ Nuevo pedido</button>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Cargando...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Sin pedidos</div>
          ) : orders.map(o => {
            const items = JSON.parse(o.items || '[]');
            return (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer active:bg-gray-50"
                onClick={() => setSelectedOrder(o)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{o.customer_name}</div>
                    <div className="text-xs font-mono text-purple-600">{o.order_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">€{o.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">{new Date(o.created_at * 1000).toLocaleDateString('es-ES')}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 truncate mb-2">{items.map((i: { name: string }) => i.name).join(', ') || '-'}</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ''}`}>{o.status}</span>
                  {o.bizum_screenshot && <span className="text-green-600 text-xs">✓ Bizum</span>}
                  {noteValues[o.id] && <span className="text-yellow-600 text-xs">📝 Nota</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nº Pedido</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Clienta</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Productos</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Total</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Bizum</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-52">Notas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Sin pedidos</td></tr>
              ) : orders.map(o => {
                const items = JSON.parse(o.items || '[]');
                const isEditingThisNote = editingNote === o.id;
                return (
                  <tr
                    key={o.id}
                    className="border-t border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setSelectedOrder(o)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-purple-700 font-medium">{o.order_number}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(o.created_at * 1000).toLocaleDateString('es-ES')}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{o.customer_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                      {items.map((i: { name: string }) => i.name).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3 font-medium">€{o.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ''}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {o.bizum_screenshot ? <span className="text-green-600 text-xs">✓ Adjunto</span> : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2 w-52" onClick={e => e.stopPropagation()}>
                      {isEditingThisNote ? (
                        <textarea
                          ref={noteRef}
                          value={noteValues[o.id] ?? ''}
                          onChange={e => setNoteValues(prev => ({ ...prev, [o.id]: e.target.value }))}
                          onBlur={() => saveNote(o.id)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote(o.id); } if (e.key === 'Escape') setEditingNote(null); }}
                          rows={2}
                          className="w-full text-xs border border-purple-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none bg-white"
                          placeholder="Añadir nota..."
                        />
                      ) : (
                        <button
                          onClick={() => setEditingNote(o.id)}
                          className={`w-full text-left text-xs rounded-lg px-2 py-1.5 min-h-[36px] transition ${
                            noteValues[o.id] ? 'text-gray-700 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {noteValues[o.id] || '+ Añadir nota'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={() => { setSelectedOrder(null); fetchOrders(); }}
        />
      )}

      {showNew && (
        <NewOrderModal
          onClose={() => setShowNew(false)}
          onSave={() => { setShowNew(false); fetchOrders(); }}
        />
      )}
    </PanelLayout>
  );
}
