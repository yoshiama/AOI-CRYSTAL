import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = getDb();
  const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as Array<{
    id: number; order_number: string; customer_name: string; customer_email: string;
    total: number; material_cost: number; created_at: number; status: string; items: string;
  }>;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Pedidos
  const ordersData = orders.map(o => ({
    'Nº Pedido': o.order_number,
    'Fecha': new Date(o.created_at * 1000).toLocaleDateString('es-ES'),
    'Clienta': o.customer_name,
    'Email': o.customer_email,
    'Total (€)': o.total,
    'Estado': o.status,
  }));
  const ws1 = XLSX.utils.json_to_sheet(ordersData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Pedidos');

  // Sheet 2: Finanzas
  const financesData = orders.filter(o => o.status !== 'cancelado').map(o => ({
    'Nº Pedido': o.order_number,
    'Fecha': new Date(o.created_at * 1000).toLocaleDateString('es-ES'),
    'Clienta': o.customer_name,
    'Ingresos (€)': o.total,
    'Coste materiales (€)': o.material_cost || 0,
    'Beneficio neto (€)': o.total - (o.material_cost || 0),
  }));
  const ws2 = XLSX.utils.json_to_sheet(financesData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Finanzas');

  // Sheet 3: Resumen
  const allOrders = orders.filter(o => o.status !== 'cancelado');
  const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);
  const totalCost = allOrders.reduce((s, o) => s + (o.material_cost || 0), 0);

  // Top product
  const productSales: Record<string, number> = {};
  allOrders.forEach(o => {
    const items = JSON.parse(o.items || '[]');
    items.forEach((item: { name: string; qty?: number }) => {
      productSales[item.name] = (productSales[item.name] || 0) + (item.qty || 1);
    });
  });
  const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];

  // Best month
  const monthRevenue: Record<string, number> = {};
  allOrders.forEach(o => {
    const key = new Date(o.created_at * 1000).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    monthRevenue[key] = (monthRevenue[key] || 0) + o.total;
  });
  const bestMonth = Object.entries(monthRevenue).sort((a, b) => b[1] - a[1])[0];

  const summaryData = [
    { 'Métrica': 'Total pedidos', 'Valor': orders.length },
    { 'Métrica': 'Ingresos totales (€)', 'Valor': totalRevenue.toFixed(2) },
    { 'Métrica': 'Costes totales (€)', 'Valor': totalCost.toFixed(2) },
    { 'Métrica': 'Beneficio total (€)', 'Valor': (totalRevenue - totalCost).toFixed(2) },
    { 'Métrica': 'Producto más vendido', 'Valor': topProduct ? `${topProduct[0]} (${topProduct[1]} uds)` : '-' },
    { 'Métrica': 'Mes con más ingresos', 'Valor': bestMonth ? `${bestMonth[0]} (€${bestMonth[1].toFixed(2)})` : '-' },
    { 'Métrica': 'Exportado el', 'Valor': new Date().toLocaleDateString('es-ES') },
  ];
  const ws3 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Resumen');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="AOI_Crystal_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
