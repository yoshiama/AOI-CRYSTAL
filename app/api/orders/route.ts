import { NextRequest, NextResponse } from 'next/server';
import { getDb, logActivity } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

function generateOrderNumber(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `AOI-${yy}${mm}${dd}-${rand}`;
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  const db = getDb();
  let query = 'SELECT * FROM orders WHERE 1=1';
  const args: (string | number)[] = [];

  if (status && status !== 'todos') {
    query += ' AND status = ?'; args.push(status);
  }
  if (search) {
    query += ' AND (customer_name LIKE ? OR order_number LIKE ?)';
    args.push(`%${search}%`, `%${search}%`);
  }
  if (dateFrom) {
    query += ' AND created_at >= ?'; args.push(parseInt(dateFrom));
  }
  if (dateTo) {
    query += ' AND created_at <= ?'; args.push(parseInt(dateTo));
  }
  query += ' ORDER BY created_at DESC';

  const orders = db.prepare(query).all(...args);
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const data = await request.json();
  const db = getDb();
  const orderNumber = generateOrderNumber();

  const result = db.prepare(`
    INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, customer_address, customer_postal, items, subtotal, shipping, total, status, bizum_screenshot, internal_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)
  `).run(
    orderNumber, data.customer_name, data.customer_email, data.customer_phone || '',
    data.customer_address || '', data.customer_postal || '',
    JSON.stringify(data.items || []),
    data.subtotal || 0, data.shipping || 0, data.total || 0,
    data.bizum_screenshot || '', data.internal_notes || ''
  );

  const orderId = result.lastInsertRowid as number;

  // Create notification
  db.prepare(`INSERT INTO notifications (type, title, message, order_id) VALUES (?, ?, ?, ?)`)
    .run('new_order', '🛍️ Nuevo pedido', `${data.customer_name} · €${data.total}`, orderId);

  logActivity('Pedido creado', 'orders', orderId, `${orderNumber} - ${data.customer_name}`);
  return NextResponse.json({ id: orderId, order_number: orderNumber });
}
