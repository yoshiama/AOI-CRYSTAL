import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/db';

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  if (sessionId) {
    deleteSession(sessionId);
    logActivity('Logout', 'users', undefined, 'Cierre de sesión');
    cookieStore.delete('session');
  }
  return NextResponse.json({ success: true });
}
