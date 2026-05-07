import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = getDb();
  const logs = db.prepare('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 100').all();
  return NextResponse.json(logs);
}
