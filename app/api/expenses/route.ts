import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const db = getDb();
  const expenses = db.prepare('SELECT * FROM expenses ORDER BY expense_date DESC').all();
  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { description, amount, category, expense_date } = await request.json();
  const db = getDb();
  const dateTs = expense_date ? Math.floor(new Date(expense_date).getTime() / 1000) : Math.floor(Date.now() / 1000);
  const result = db.prepare('INSERT INTO expenses (description, amount, category, expense_date) VALUES (?, ?, ?, ?)').run(description, amount, category || 'material', dateTs);
  return NextResponse.json({ id: result.lastInsertRowid });
}
