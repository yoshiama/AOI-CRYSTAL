'use client';
import { useEffect, useState } from 'react';
import PanelLayout from '@/components/PanelLayout';

interface Order {
  id: number; order_number: string; customer_name: string; total: number;
  material_cost: number; created_at: number; status: string;
}

interface Totals {
  today: { revenue: number; cost: number; profit: number };
  week: { revenue: number; cost: number; profit: number };
  month: { revenue: number; cost: number; profit: number };
  prevMonth: { revenue: number; cost: number; profit: number };
  all: { revenue: number; cost: number; profit: number };
}

export default function FinanzasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [editCost, setEditCost] = useState<{ id: number; val: string } | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch('/api/finances');
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
      setTotals(data.totals);
    }
    setLoading(false);
  }

  async function saveCost(id: number, cost: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ material_cost: parseFloat(cost) || 0 }),
    });
    setEditCost(null);
    fetchData();
  }

  async function handleExport() {
    setExporting(true);
    const res = await fetch('/api/finances/export');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AOI_Crystal_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <PanelLayout>
      <div className="space-y-5">
        {/* Summary cards */}
        {totals && (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Hoy', data: totals.today },
              { label: 'Esta semana', data: totals.week },
              { label: 'Este mes', data: totals.month },
              { label: 'Total histórico', data: totals.all },
            ].map(({ label, data }) => (
              <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-xs text-gray-500 mb-2">{label}</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Ingresos</span><span className="font-medium text-blue-600">€{data.revenue.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Costes</span><span className="font-medium text-orange-500">€{data.cost.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm border-t border-gray-100 pt-1"><span className="font-medium">Beneficio</span><span className={`font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>€{data.profit.toFixed(2)}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comparison */}
        {totals && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Este mes vs mes anterior</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {['revenue', 'cost', 'profit'].map(key => {
                const curr = totals.month[key as keyof typeof totals.month];
                const prev = totals.prevMonth[key as keyof typeof totals.prevMonth];
                const diff = curr - prev;
                const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : null;
                const labels: Record<string, string> = { revenue: 'Ingresos', cost: 'Costes', profit: 'Beneficio' };
                return (
                  <div key={key} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">{labels[key]}</div>
                    <div className="text-xl font-bold text-gray-800 mt-1">€{(curr as number).toFixed(2)}</div>
                    {pct && <div className={`text-xs mt-1 ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>{diff >= 0 ? '+' : ''}{pct}% vs mes ant.</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Registro por pedido</h3>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {exporting ? '⏳' : '📊'} Exportar Excel
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Pedido</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Clienta</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ingresos</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Costes</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Beneficio</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin datos</td></tr>
              ) : orders.map(o => {
                const profit = o.total - (o.material_cost || 0);
                return (
                  <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-purple-700">{o.order_number}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(o.created_at * 1000).toLocaleDateString('es-ES')}</td>
                    <td className="px-4 py-3 text-gray-800">{o.customer_name}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium">€{o.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {editCost?.id === o.id ? (
                        <div className="flex gap-1">
                          <input
                            type="number" step="0.01"
                            value={editCost.val}
                            onChange={e => setEditCost({ id: o.id, val: e.target.value })}
                            className="w-20 border border-purple-300 rounded-lg px-2 py-0.5 text-xs"
                            autoFocus
                          />
                          <button onClick={() => saveCost(o.id, editCost.val)} className="text-green-600 text-xs font-medium">✓</button>
                          <button onClick={() => setEditCost(null)} className="text-gray-400 text-xs">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditCost({ id: o.id, val: o.material_cost?.toString() || '0' })} className="text-orange-500 font-medium hover:underline">
                          €{(o.material_cost || 0).toFixed(2)}
                        </button>
                      )}
                    </td>
                    <td className={`px-4 py-3 font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>€{profit.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PanelLayout>
  );
}
