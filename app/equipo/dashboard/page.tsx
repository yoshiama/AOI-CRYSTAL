'use client';
import { useEffect, useState } from 'react';
import PanelLayout from '@/components/PanelLayout';
import Link from 'next/link';

interface DashboardData {
  ordersToday: number;
  ordersPending: number;
  revenueToday: number;
  revenueMonth: number;
  revenuePrevMonth: number;
  sales7days: { label: string; revenue: number }[];
  topProducts: { name: string; qty: number }[];
  recentOrders: Array<{
    id: number; order_number: string; customer_name: string; total: number; status: string; created_at: number;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  confirmado: 'bg-blue-100 text-blue-700',
  enviado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    const res = await fetch('/api/dashboard');
    if (res.ok) setData(await res.json());
  }

  if (!data) return (
    <PanelLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Cargando dashboard...</div>
      </div>
    </PanelLayout>
  );

  const maxRevenue = Math.max(...data.sales7days.map(d => d.revenue), 1);
  const monthDiff = data.revenueMonth - data.revenuePrevMonth;
  const monthPct = data.revenuePrevMonth > 0 ? ((monthDiff / data.revenuePrevMonth) * 100).toFixed(1) : null;

  return (
    <PanelLayout>
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard icon="🛍️" label="Pedidos hoy" value={String(data.ordersToday)} />
          <StatCard
            icon="⏳"
            label="Pendientes"
            value={String(data.ordersPending)}
            alert={data.ordersPending > 3}
            alertMsg="Más de 3 pendientes"
          />
          <StatCard icon="💶" label="Ingresos hoy" value={`€${data.revenueToday.toFixed(2)}`} />
          <StatCard
            icon="📈"
            label="Ingresos este mes"
            value={`€${data.revenueMonth.toFixed(2)}`}
            sub={monthPct ? `${monthDiff >= 0 ? '+' : ''}${monthPct}% vs mes anterior` : undefined}
            subColor={monthDiff >= 0 ? 'text-green-600' : 'text-red-500'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sales chart */}
          <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Ventas últimos 7 días</h3>
            <div className="flex items-end gap-2 h-32">
              {data.sales7days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-500">€{d.revenue > 0 ? d.revenue.toFixed(0) : ''}</div>
                  <div
                    className="w-full bg-purple-400 rounded-t-lg transition-all"
                    style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 8 : 2)}%`, minHeight: '2px' }}
                  />
                  <div className="text-xs text-gray-500 text-center leading-tight">{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Más vendidos</h3>
            <div className="space-y-2">
              {data.topProducts.length === 0 ? (
                <p className="text-gray-400 text-sm">Sin datos aún</p>
              ) : data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate">{p.name}</span>
                  <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">{p.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Últimos pedidos</h3>
            <Link href="/equipo/pedidos" className="text-sm text-purple-600 hover:underline">Ver todos →</Link>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {data.recentOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">Sin pedidos aún</div>
            ) : data.recentOrders.map(o => (
              <div key={o.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-800 text-sm truncate">{o.customer_name}</div>
                  <div className="text-xs text-gray-400 font-mono">{o.order_number}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-sm">€{o.total.toFixed(2)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ''}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Pedido</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Clienta</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Total</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Estado</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Sin pedidos aún</td></tr>
              ) : data.recentOrders.map(o => (
                <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{o.order_number}</td>
                  <td className="px-5 py-3 text-gray-800">{o.customer_name}</td>
                  <td className="px-5 py-3 font-medium">€{o.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ''}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{new Date(o.created_at * 1000).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PanelLayout>
  );
}

function StatCard({ icon, label, value, alert, alertMsg, sub, subColor }: {
  icon: string; label: string; value: string; alert?: boolean; alertMsg?: string; sub?: string; subColor?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${alert ? 'border-yellow-300' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">{label}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {sub && <div className={`text-xs mt-1 ${subColor || 'text-gray-500'}`}>{sub}</div>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      {alert && alertMsg && (
        <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 rounded-lg px-2 py-1">⚠️ {alertMsg}</div>
      )}
    </div>
  );
}
