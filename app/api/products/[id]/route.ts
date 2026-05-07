import { NextRequest, NextResponse } from 'next/server';
import { getDb, logActivity } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  const data = await request.json();
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  db.prepare(`
    UPDATE products SET name=?, category=?, description=?, price=?, photos=?, colors=?, finishes=?, custom_text=?, visible=?, updated_at=?
    WHERE id=?
  `).run(
    data.name, data.category, data.description || '', data.price,
    JSON.stringify(data.photos || []),
    JSON.stringify(data.colors || []),
    JSON.stringify(data.finishes || []),
    data.custom_text || '',
    data.visible ? 1 : 0,
    now, id
  );

  logActivity('Producto editado', 'products', parseInt(id), data.name);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const product = db.prepare('SELECT name FROM products WHERE id = ?').get(id) as { name: string } | undefined;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  logActivity('Producto eliminado', 'products', parseInt(id), product?.name);
  return NextResponse.json({ success: true });
}
