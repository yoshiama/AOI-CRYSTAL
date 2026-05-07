import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayTs = Math.floor(todayStart.getTime() / 1000);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthTs = Math.floor(monthStart.getTime() / 1000);
  const prevMonthStart = new Date(monthStart); prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
  const prevMonthTs = Math.floor(prevMonthStart.getTime() / 1000);

  const ordersToday = (db.prepare('SELECT COUNT(*) as c FROM orders WHERE created_at >= ?').get(todayTs) as { c: number }).c;
  const ordersPending = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pendiente'").get() as { c: number }).c;
  const revenueToday = (db.prepare("SELECT COALESCE(SUM(total),0) as s FROM orders WHERE created_at >= ? AND status != 'cancelado'").get(todayTs) as { s: number }).s;
  const revenueMonth = (db.prepare("SELECT COALESCE(SUM(total),0) as s FROM orders WHERE created_at >= ? AND status != 'cancelado'").get(monthTs) as { s: number }).s;
  const revenuePrevMonth = (db.prepare("SELECT COALESCE(SUM(total),0) as s FROM orders WHERE created_at >= ? AND created_at < ? AND status != 'cancelado'").get(prevMonthTs, monthTs) as { s: number }).s;

  // Last 7 days chart
  const sales7days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    const dStart = Math.floor(d.getTime() / 1000);
    const dEnd = dStart + 86400;
    const rev = (db.prepare("SELECT COALESCE(SUM(total),0) as s FROM orders WHERE created_at >= ? AND created_at < ? AND status != 'cancelado'").get(dStart, dEnd) as { s: number }).s;
    const label = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    sales7days.push({ label, revenue: rev });
  }

  // Top products
  const allOrders = db.prepare("SELECT items FROM orders WHERE status != 'cancelado'").all() as { items: string }[];
  const productSales: Record<string, number> = {};
  allOrders.forEach(o => {
    const items = JSON.parse(o.items || '[]');
    items.forEach((item: { name: string; qty?: number }) => {
      productSales[item.name] = (productSales[item.name] || 0) + (item.qty || 1);
    });
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10').all();

  return NextResponse.json({
    ordersToday,
    ordersPending,
    revenueToday,
    revenueMonth,
    revenuePrevMonth,
    sales7days,
    topProducts,
    recentOrders,
  });
}
