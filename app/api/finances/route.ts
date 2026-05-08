import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = getDb();
  const orders = db.prepare("SELECT * FROM orders WHERE status != 'cancelado' ORDER BY created_at DESC").all() as Array<{
    id: number; order_number: string; customer_name: string; total: number; material_cost: number; created_at: number; status: string;
  }>;

  const expenses = db.prepare('SELECT * FROM expenses ORDER BY expense_date DESC').all() as Array<{
    id: number; description: string; amount: number; category: string; expense_date: number;
  }>;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const settings = db.prepare("SELECT key, value FROM settings WHERE key IN ('split_employees','split_company')").all() as { key: string; value: string }[];
  const splitMap: Record<string, number> = {};
  for (const s of settings) splitMap[s.key] = parseFloat(s.value) || 0;
  const splitEmployees = splitMap['split_employees'] ?? 70;
  const splitCompany = splitMap['split_company'] ?? 30;

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const prevMonthStart = new Date(monthStart); prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  const todayTs = Math.floor(todayStart.getTime() / 1000);
  const weekTs = Math.floor(weekStart.getTime() / 1000);
  const monthTs = Math.floor(monthStart.getTime() / 1000);
  const prevMonthTs = Math.floor(prevMonthStart.getTime() / 1000);

  const totals = {
    today: { revenue: 0, cost: 0, profit: 0 },
    week: { revenue: 0, cost: 0, profit: 0 },
    month: { revenue: 0, cost: 0, profit: 0 },
    prevMonth: { revenue: 0, cost: 0, profit: 0 },
    all: { revenue: 0, cost: 0, profit: 0 },
  };

  orders.forEach(o => {
    const profit = o.total - (o.material_cost || 0);
    totals.all.revenue += o.total;
    totals.all.cost += o.material_cost || 0;
    totals.all.profit += profit;
    if (o.created_at >= todayTs) { totals.today.revenue += o.total; totals.today.cost += o.material_cost || 0; totals.today.profit += profit; }
    if (o.created_at >= weekTs) { totals.week.revenue += o.total; totals.week.cost += o.material_cost || 0; totals.week.profit += profit; }
    if (o.created_at >= monthTs) { totals.month.revenue += o.total; totals.month.cost += o.material_cost || 0; totals.month.profit += profit; }
    if (o.created_at >= prevMonthTs && o.created_at < monthTs) { totals.prevMonth.revenue += o.total; totals.prevMonth.cost += o.material_cost || 0; totals.prevMonth.profit += profit; }
  });

  return NextResponse.json({ orders, totals, expenses, totalExpenses, splitEmployees, splitCompany });
}
