'use client';
import { useState } from 'react';

interface OrderItem { name: string; qty?: number; price?: number; options?: string }

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

const STATUSES = ['pendiente', 'confirmado', 'enviado', 'cancelado'];

export default function OrderDetail({ order, onClose, onUpdate }: {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.internal_notes || '');
  const [materialCost, setMaterialCost] = useState(order.material_cost?.toString() || '0');
  const [saving, setSaving] = useState(false);
  const [editingItems, setEditingItems] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [items, setItems] = useState<OrderItem[]>(JSON.parse(order.items || '[]'));
  const [shipping, setShipping] = useState(order.shipping);

  const itemsTotal = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const total = itemsTotal + shipping;
  const profit = total - (parseFloat(materialCost) || 0);

  function updateItem(idx: number, field: keyof OrderItem, value: string | number) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        internal_notes: notes,
        material_cost: parseFloat(materialCost) || 0,
        ...(editingItems ? { items: JSON.stringify(items), shipping, subtotal: itemsTotal, total } : {}),
      }),
    });
    setSaving(false);
    onUpdate();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800">{order.order_number}</h2>
            <p className="text-xs text-gray-400">{new Date(order.created_at * 1000).toLocaleString('es-ES')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer */}
          <div className="bg-purple-50 rounded-xl p-4 space-y-1">
            <h3 className="font-medium text-purple-800 text-sm mb-2">Datos de la clienta</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Nombre:</span> <span className="font-medium">{order.customer_name}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{order.customer_email}</span></div>
              <div><span className="text-gray-500">Teléfono:</span> <span className="font-medium">{order.customer_phone || '—'}</span></div>
              <div><span className="text-gray-500">CP:</span> <span className="font-medium">{order.customer_postal || '—'}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Dirección:</span> <span className="font-medium">{order.customer_address || '—'}</span></div>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800 text-sm">Productos encargados</h3>
              <button
                onClick={() => setEditingItems(!editingItems)}
                className="text-xs text-purple-600 hover:underline font-medium"
              >{editingItems ? '✓ Confirmar cambios' : '✏️ Modificar'}</button>
            </div>

            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 text-sm gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    {item.options && <span className="text-gray-400 ml-2 text-xs">({item.options})</span>}
                  </div>
                  {editingItems ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="text-xs text-gray-500">x</label>
                      <input
                        type="number" min="1" value={item.qty || 1}
                        onChange={e => updateItem(i, 'qty', parseInt(e.target.value) || 1)}
                        className="w-12 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                      />
                      <label className="text-xs text-gray-500">€</label>
                      <input
                        type="number" min="0" step="0.01" value={item.price || 0}
                        onChange={e => updateItem(i, 'price', parseFloat(e.target.value) || 0)}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                      />
                      <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-gray-500">x{item.qty || 1}</span>
                      <span className="font-medium">€{((item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm mt-2 px-4">
              <span className="text-gray-500">Envío</span>
              {editingItems ? (
                <input
                  type="number" min="0" step="0.01" value={shipping}
                  onChange={e => setShipping(parseFloat(e.target.value) || 0)}
                  className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                />
              ) : (
                <span>€{shipping.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between font-bold text-base mt-1 px-4 text-purple-700">
              <span>Total</span><span>€{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Bizum */}
          {order.bizum_screenshot && (
            <div>
              <h3 className="font-medium text-gray-800 text-sm mb-2">Captura del Bizum</h3>
              <img src={order.bizum_screenshot} alt="Bizum" className="rounded-xl max-h-48 object-contain border border-gray-200" />
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="font-medium text-gray-800 text-sm mb-2">Estado del pedido</h3>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition border-2 ${
                    status === s ? `border-transparent ${STATUS_COLORS[s]}` : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >{s}</button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Al confirmar/enviar/cancelar se enviará email automático a la clienta</p>
          </div>

          {/* Financial */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Coste de materiales (€)</label>
              <input
                type="number" step="0.01" value={materialCost}
                onChange={e => setMaterialCost(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div className="bg-green-50 rounded-xl px-4 py-3 flex flex-col justify-center">
              <div className="text-xs text-gray-500">Beneficio neto</div>
              <div className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                €{profit.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Notas internas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
              placeholder="Notas solo para el equipo..."
            />
          </div>

          {confirmDelete ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-red-700">¿Eliminar este pedido? Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm hover:bg-gray-50">Cancelar</button>
                <button
                  onClick={async () => {
                    await fetch(`/api/orders/${order.id}`, { method: 'DELETE' });
                    onUpdate();
                  }}
                  className="flex-1 bg-red-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-red-600"
                >Sí, eliminar</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(true)} className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50">🗑️ Eliminar</button>
              <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
