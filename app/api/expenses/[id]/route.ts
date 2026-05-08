import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
