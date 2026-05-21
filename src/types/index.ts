// 'text' = 网页选区原文；'note' = 用户自己的 Aha moment / 想法
export type CaptureKind = 'text' | 'note' | 'fulltext' | 'video-marker'

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

// 精简=brief / 正常=structured / 详细=detailed（均调用 AI）；原文导出=raw（不调用 AI）
export type GenerationMode = 'brief' | 'structured' | 'detailed' | 'raw'

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
  | 'capture-note'
  | 'toggle-floating'
  | 'generate'

export type Message =
  | { type: 'CAPTURE' }
  | { type: 'NOTE' }            // 唤起 Aha moment 输入框
  | { type: 'TOGGLE_FLOATING' }
  | { type: 'GENERATE' }
  | { type: 'DOWNLOAD_MARKDOWN'; content: string; filename: string }
