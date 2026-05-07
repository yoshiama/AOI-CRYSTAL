import { NextRequest, NextResponse } from 'next/server';
import { getDb, logActivity } from '@/lib/db';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const BLOCK_DURATION = 15 * 60; // 15 min in seconds

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as {
    id: number; username: string; password: string; failed_attempts: number; locked_until: number;
  } | undefined;

  if (!user) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
  }

  if (user.locked_until > now) {
    const remaining = Math.ceil((user.locked_until - now) / 60);
    return NextResponse.json({ error: `Cuenta bloqueada. Inténtalo en ${remaining} minuto(s)` }, { status: 429 });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    const newAttempts = user.failed_attempts + 1;
    if (newAttempts >= 3) {
      db.prepare('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?').run(newAttempts, now + BLOCK_DURATION, user.id);
      return NextResponse.json({ error: 'Demasiados intentos fallidos. Cuenta bloqueada 15 minutos' }, { status: 429 });
    }
    db.prepare('UPDATE users SET failed_attempts = ? WHERE id = ?').run(newAttempts, user.id);
    return NextResponse.json({ error: `Contraseña incorrecta. ${3 - newAttempts} intentos restantes` }, { status: 401 });
  }

  db.prepare('UPDATE users SET failed_attempts = 0, locked_until = 0 WHERE id = ?').run(user.id);
  const sessionId = createSession(user.id);

  const cookieStore = await cookies();
  cookieStore.set('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/',
  });

  logActivity('Login', 'users', user.id, `Acceso al panel`);
  return NextResponse.json({ success: true });
}
