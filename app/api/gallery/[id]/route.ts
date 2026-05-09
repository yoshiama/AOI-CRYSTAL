import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { unlink } from 'fs/promises';
import path from 'path';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getSessionFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { caption } = await req.json();
  const db = getDb();
  db.prepare('UPDATE gallery SET caption = ? WHERE id = ?').run(caption, params.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getSessionFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(params.id) as { filename: string } | undefined;
  if (item) {
    try {
      await unlink(path.join(process.cwd(), 'data', 'gallery', item.filename));
    } catch {}
    db.prepare('DELETE FROM gallery WHERE id = ?').run(params.id);
  }
  return NextResponse.json({ ok: true });
}
