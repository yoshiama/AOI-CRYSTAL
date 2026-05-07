import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let lastId = (getDb().prepare('SELECT MAX(id) as m FROM notifications').get() as { m: number | null }).m || 0;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
      };

      send(JSON.stringify({ type: 'connected' }));

      const interval = setInterval(() => {
        try {
          const db = getDb();
          const newNotifs = db.prepare('SELECT * FROM notifications WHERE id > ? ORDER BY id ASC').all(lastId) as Array<{ id: number; type: string; title: string; message: string; order_id: number; created_at: number }>;
          if (newNotifs.length > 0) {
            lastId = newNotifs[newNotifs.length - 1].id;
            send(JSON.stringify({ type: 'notifications', data: newNotifs }));
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
