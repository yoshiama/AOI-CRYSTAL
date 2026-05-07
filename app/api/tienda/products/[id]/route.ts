import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND visible = 1').get(id);
  if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  const related = db.prepare('SELECT * FROM products WHERE category = (SELECT category FROM products WHERE id = ?) AND id != ? AND visible = 1 LIMIT 4').all(id, id);
  return NextResponse.json({ product, related });
}
