import Dexie, { type Table } from 'dexie'
import type { Session, Capture, Generation, GenerationMode } from '../types'

// IndexedDB：会话 / 捕获 / 生成
export class InstantNotesDB extends Dexie {
  sessions!: Table<Session, string>
  captures!: Table<Capture, string>
  generations!: Table<Generation, string>

  constructor() {
    super('InstantNotes')
    this.version(1).stores({
      sessions: 'id, sourceUrl, startedAt, status',
      captures: 'id, sessionId, position, capturedAt',
      generations: 'id, sessionId, generatedAt'
    })
    // v2：新增 kind 索引，便于按「原文 / 个人想法」筛选。
    // 仅加索引，老数据无需改写，Dexie 自动升级。
    this.version(2).stores({
      sessions: 'id, sourceUrl, startedAt, status',
      captures: 'id, sessionId, kind, position, capturedAt',
      generations: 'id, sessionId, generatedAt'
    })
  }
}

export const db = new InstantNotesDB()

// chrome.storage.local：小型设置（OpenRouter API key、默认模型等）
export interface Settings {
  apiKey?: string
  model?: string
  defaultMode?: GenerationMode
  // Aha moment 默认是否融合进结构化笔记（false = 单列保留）
  mergeNotes?: boolean
}

const SETTINGS_KEY = 'in_settings_v1'

export async function getSettings(): Promise<Settings> {
  const r = await chrome.storage.local.get(SETTINGS_KEY)
  return (r[SETTINGS_KEY] ?? {}) as Settings
}

export async function setSettings(patch: Partial<Settings>): Promise<void> {
  const cur = await getSettings()
  const next: Settings = {
    apiKey: patch.apiKey ?? cur.apiKey,
    model: patch.model ?? cur.model,
    defaultMode: patch.defaultMode ?? cur.defaultMode,
    mergeNotes: patch.mergeNotes ?? cur.mergeNotes
  }
  await chrome.storage.local.set({ [SETTINGS_KEY]: next })
}
