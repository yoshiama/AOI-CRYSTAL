import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const db = getDb();
  const payments = db.prepare('SELECT * FROM salary_payments ORDER BY paid_at DESC').all();
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { amount, recipient, note, paid_at } = await req.json();
  const db = getDb();
  const paidTs = paid_at ? Math.floor(new Date(paid_at).getTime() / 1000) : Math.floor(Date.now() / 1000);
  const result = db.prepare(
    'INSERT INTO salary_payments (amount, recipient, note, paid_at) VALUES (?, ?, ?, ?)'
  ).run(amount, recipient || 'empleadas', note || '', paidTs);
  const item = db.prepare('SELECT * FROM salary_payments WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(item);
}
