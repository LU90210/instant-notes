import { db } from './storage'
import type { Session } from '../types'

// 30 分钟无活动则换新 Session（同 URL 也算新会话）
const SESSION_IDLE_MS = 30 * 60 * 1000

export async function resolveSession(args: {
  url: string
  title: string
  faviconUrl?: string
}): Promise<Session> {
  const now = Date.now()
  const existing = await db.sessions
    .where('sourceUrl').equals(args.url)
    .and(s => s.status === 'active' && (now - s.startedAt) < SESSION_IDLE_MS)
    .first()
  if (existing) return existing

  const fresh: Session = {
    id: crypto.randomUUID(),
    sourceUrl: args.url,
    sourceTitle: args.title,
    faviconUrl: args.faviconUrl,
    displayName: args.title || args.url,
    startedAt: now,
    status: 'active'
  }
  await db.sessions.put(fresh)
  return fresh
}

export async function archiveSession(id: string): Promise<void> {
  await db.sessions.update(id, { status: 'archived', endedAt: Date.now() })
}
