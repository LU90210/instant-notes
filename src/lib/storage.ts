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
  }
}

export const db = new InstantNotesDB()

// chrome.storage.local：小型设置（API key、默认模型等）
export interface Settings {
  anthropicApiKey?: string
  defaultModel?: string
  defaultMode?: GenerationMode
}

const SETTINGS_KEY = 'in_settings_v1'

export async function getSettings(): Promise<Settings> {
  const r = await chrome.storage.local.get(SETTINGS_KEY)
  return (r[SETTINGS_KEY] ?? {}) as Settings
}

export async function setSettings(patch: Partial<Settings>): Promise<void> {
  const cur = await getSettings()
  await chrome.storage.local.set({ [SETTINGS_KEY]: { ...cur, ...patch } })
}
