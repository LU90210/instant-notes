export type CaptureKind = 'text' | 'fulltext' | 'video-marker'

export interface Capture {
  id: string
  sessionId: string
  kind: CaptureKind
  content: string
  videoTimeSec?: number
  aiAside?: string
  position: number
  capturedAt: number
}

export interface Session {
  id: string
  sourceUrl: string
  sourceTitle: string
  faviconUrl?: string
  displayName: string
  startedAt: number
  endedAt?: number
  status: 'active' | 'archived'
}

export type GenerationMode = 'brief' | 'structured' | 'raw' | 'combo'

export interface Generation {
  id: string
  sessionId: string
  mode: GenerationMode
  model: string
  prompt: string
  output: string
  exportedTo?: string
  generatedAt: number
}

export type CommandName =
  | 'silent-capture'
  | 'capture-and-ask'
  | 'toggle-floating'
  | 'generate'

export type Message =
  | { type: 'CAPTURE'; askAI: boolean }
  | { type: 'TOGGLE_FLOATING' }
  | { type: 'GENERATE' }
