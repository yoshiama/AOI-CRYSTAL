import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = getDb();
  const cutoff = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60; // 7 days
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE created_at >= ? ORDER BY created_at DESC LIMIT 50
  `).all(cutoff);
  const unread = (db.prepare('SELECT COUNT(*) as c FROM notifications WHERE read = 0').get() as { c: number }).c;

  return NextResponse.json({ notifications, unread });
}

export async function PUT() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = getDb();
  db.prepare('UPDATE notifications SET read = 1').run();
  return NextResponse.json({ success: true });
}
