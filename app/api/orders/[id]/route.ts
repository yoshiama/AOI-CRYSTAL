import { NextRequest, NextResponse } from 'next/server';
import { getDb, logActivity } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { sendOrderConfirmationEmail, sendShippedEmail, sendCancelledEmail } from '@/lib/email';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  const data = await request.json();
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as {
    status: string; customer_name: string; customer_email: string; order_number: string; items: string; total: number;
  } | undefined;
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
  if (data.internal_notes !== undefined) { fields.push('internal_notes = ?'); values.push(data.internal_notes); }
  if (data.material_cost !== undefined) { fields.push('material_cost = ?'); values.push(data.material_cost); }
  if (data.bizum_screenshot !== undefined) { fields.push('bizum_screenshot = ?'); values.push(data.bizum_screenshot); }
  if (data.items !== undefined) { fields.push('items = ?'); values.push(data.items); }
  if (data.subtotal !== undefined) { fields.push('subtotal = ?'); values.push(data.subtotal); }
  if (data.shipping !== undefined) { fields.push('shipping = ?'); values.push(data.shipping); }
  if (data.total !== undefined) { fields.push('total = ?'); values.push(data.total); }
  fields.push('updated_at = ?'); values.push(now);
  values.push(parseInt(id));

  db.prepare(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  // Send email on status change
  if (data.status && data.status !== existing.status) {
    const items = JSON.parse(existing.items || '[]');
    const emailData = {
      customerName: existing.customer_name,
      customerEmail: existing.customer_email,
      orderNumber: existing.order_number,
      items,
      total: existing.total,
      status: data.status,
    };

    try {
      if (data.status === 'confirmado') await sendOrderConfirmationEmail(emailData);
      else if (data.status === 'enviado') await sendShippedEmail(emailData);
      else if (data.status === 'cancelado') await sendCancelledEmail(emailData);
    } catch { /* email not configured */ }

    // Notification for new order confirmation
    if (data.status === 'confirmado') {
      db.prepare(`INSERT INTO notifications (type, title, message, order_id) VALUES (?, ?, ?, ?)`)
        .run('status_change', '✅ Pedido confirmado', `${existing.customer_name} · ${existing.order_number}`, parseInt(id));
    }

    logActivity(`Estado cambiado a "${data.status}"`, 'orders', parseInt(id), existing.order_number);
  }

  return NextResponse.json({ success: true });
}
