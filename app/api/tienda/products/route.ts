import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const db = getDb();
  let query = 'SELECT * FROM products WHERE visible = 1';
  const args: string[] = [];
  if (category && category !== 'todos') {
    query += ' AND category = ?';
    args.push(category);
  }
  query += ' ORDER BY created_at DESC';
  const products = db.prepare(query).all(...args);
  return NextResponse.json(products);
}
