import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  const db = getDb();
  const items = db.prepare('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC').all();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const auth = await getSessionFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const caption = (formData.get('caption') as string) || '';

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `gallery_${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), 'data', 'gallery');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  const db = getDb();
  const result = db.prepare('INSERT INTO gallery (filename, caption) VALUES (?, ?)').run(filename, caption);
  const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(item);
}
