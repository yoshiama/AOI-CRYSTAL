'use client';
import { useEffect, useState } from 'react';
import PanelLayout from '@/components/PanelLayout';

interface Order {
  id: number; order_number: string; customer_name: string; total: number;
  material_cost: number; created_at: number; status: string;
}

interface Expense {
  id: number; description: string; amount: number; category: string; expense_date: number;
}

interface Totals {
  today: { revenue: number; cost: number; profit: number };
  week: { revenue: number; cost: number; profit: number };
  month: { revenue: number; cost: number; profit: number };
  prevMonth: { revenue: number; cost: number; profit: number };
  all: { revenue: number; cost: number; profit: number };
}

const EXPENSE_CATEGORIES = ['material', 'herramienta', 'envío', 'packaging', 'otros'];

export default function FinanzasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [splitEmployees, setSplitEmployees] = useState(70);
  const [splitCompany, setSplitCompany] = useState(30);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [editCost, setEditCost] = useState<{ id: number; val: string } | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'material', expense_date: new Date().toISOString().slice(0, 10) });
  const [savingExpense, setSavingExpense] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch('/api/finances');
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
      setTotals(data.totals);
      setExpenses(data.expenses || []);
      setTotalExpenses(data.totalExpenses || 0);
      setSplitEmployees(data.splitEmployees ?? 70);
      setSplitCompany(data.splitCompany ?? 30);
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

  async function addExpense() {
    if (!newExpense.description || !newExpense.amount) return;
    setSavingExpense(true);
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newExpense, amount: parseFloat(newExpense.amount) }),
    });
    setSavingExpense(false);
    setShowAddExpense(false);
    setNewExpense({ description: '', amount: '', category: 'material', expense_date: new Date().toISOString().slice(0, 10) });
    fetchData();
  }

  async function deleteExpense(id: number) {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
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

  const grossProfit = totals ? totals.all.profit : 0;
  const forEmployees = grossProfit * (splitEmployees / 100);
  const forCompanyGross = grossProfit * (splitCompany / 100);
  const forCompanyNet = forCompanyGross - totalExpenses;

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

        {/* Reparto 70/30 */}
        {totals && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Reparto de beneficios</h3>

            {/* Total */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center mb-5">
              <span className="text-sm text-gray-500">Beneficio total (pedidos enviados)</span>
              <span className="font-bold text-gray-800 text-lg">€{grossProfit.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Empleadas */}
              <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                <div className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-3">{splitEmployees}% Empleadas</div>
                <div className="text-3xl font-bold text-purple-700 mb-1">€{forEmployees.toFixed(2)}</div>
                <div className="text-sm text-purple-400">€{(forEmployees / 2).toFixed(2)} por persona</div>
              </div>

              {/* Empresa */}
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <div className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">{splitCompany}% Empresa</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-blue-700">
                    <span>Bruto</span>
                    <span className="font-semibold">€{forCompanyGross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>— Gastos</span>
                    <span className="font-semibold">€{totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between">
                    <span className="font-bold text-blue-800">Saldo disponible</span>
                    <span className={`font-bold text-lg ${forCompanyNet >= 0 ? 'text-blue-700' : 'text-red-500'}`}>
                      €{forCompanyNet.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-800">Compras y gastos de la empresa</h3>
              <p className="text-xs text-gray-400 mt-0.5">Total: <span className="font-medium text-orange-600">€{totalExpenses.toFixed(2)}</span></p>
            </div>
            <button
              onClick={() => setShowAddExpense(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition"
            >+ Añadir gasto</button>
          </div>

          {showAddExpense && (
            <div className="px-5 py-4 bg-orange-50 border-b border-orange-100">
              <div className="grid grid-cols-4 gap-3">
                <input
                  placeholder="Descripción"
                  value={newExpense.description}
                  onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))}
                  className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <input
                  type="number" placeholder="Importe €" step="0.01"
                  value={newExpense.amount}
                  onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <select
                  value={newExpense.category}
                  onChange={e => setNewExpense(p => ({ ...p, category: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="date"
                  value={newExpense.expense_date}
                  onChange={e => setNewExpense(p => ({ ...p, expense_date: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <div className="col-span-3 flex gap-2">
                  <button onClick={addExpense} disabled={savingExpense} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                    {savingExpense ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setShowAddExpense(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                </div>
              </div>
            </div>
          )}

          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Descripción</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Categoría</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Importe</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin gastos registrados</td></tr>
              ) : expenses.map(e => (
                <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{new Date(e.expense_date * 1000).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-3 text-gray-800">{e.description}</td>
                  <td className="px-4 py-3"><span className="capitalize text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{e.category}</span></td>
                  <td className="px-4 py-3 font-medium text-orange-600">€{e.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteExpense(e.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Orders table */}
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
