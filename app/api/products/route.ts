import { NextRequest, NextResponse } from 'next/server';
import { getDb, logActivity } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = getDb();
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const data = await request.json();
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO products (name, category, description, price, photos, colors, finishes, custom_text, visible, product_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.name, data.category, data.description || '', data.price,
    JSON.stringify(data.photos || []),
    JSON.stringify(data.colors || []),
    JSON.stringify(data.finishes || []),
    data.custom_text || '',
    data.visible ? 1 : 0,
    data.product_type || 'standard'
  );

  logActivity('Producto creado', 'products', result.lastInsertRowid as number, data.name);
  return NextResponse.json({ id: result.lastInsertRowid });
}
