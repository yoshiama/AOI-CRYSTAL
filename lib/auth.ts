import { cookies } from 'next/headers';
import { getDb } from './db';
import crypto from 'crypto';

const SESSION_DURATION = 8 * 60 * 60; // 8 hours in seconds

export function createSession(userId: number): string {
  const db = getDb();
  const sessionId = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, userId, expiresAt);
  return sessionId;
}

export function getSession(sessionId: string) {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const session = db.prepare(`
    SELECT s.*, u.username FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?
  `).get(sessionId, now);
  return session as { id: string; user_id: number; username: string; expires_at: number } | undefined;
}

export function deleteSession(sessionId: string) {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

export function cleanExpiredSessions() {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
}
