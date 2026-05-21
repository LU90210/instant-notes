import type { Capture, GenerationMode } from '../types'

export interface RenderArgs {
  displayName: string
  sourceUrl: string
  capturedAt: Date
  captureCount: number
  model: string
  mode: GenerationMode
  aiOutput: string
  captures: Capture[]
  mergeNotes: boolean
}

function formatTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function quoteNote(content: string): string {
  return `> 💡 我的想法：${content.split('\n').join(' ')}`
}

export function renderMarkdown(a: RenderArgs): string {
  let s = `# ${a.displayName}\n\n`

  if (a.mode === 'raw') {
    // 原文导出：不调用 AI，按捕获顺序逐条呈现，区分原文与我的想法
    for (const c of a.captures) {
      if (c.kind === 'note') {
        s += `${quoteNote(c.content)}\n\n`
      } else {
        const quoted = c.content.split('\n').map(l => `> ${l}`).join('\n')
        s += `${quoted}\n\n`
      }
    }
  } else {
    s += a.aiOutput.trim() + '\n'
    // 未融合时，把个人想法明确单列在结尾，避免与原文混淆
    if (!a.mergeNotes) {
      const notes = a.captures.filter(c => c.kind === 'note')
      if (notes.length) {
        s += '\n## 💡 我的想法\n\n'
        for (const n of notes) s += `${quoteNote(n.content)}\n\n`
      }
    }
  }

  // 轻量元信息放在结尾：来源标题 + 链接、时间、条数、模型
  s += '\n---\n'
  s += `来源：[${a.displayName}](${a.sourceUrl})\n\n`
  s += `捕获时间：${formatTime(a.capturedAt)} · 共 ${a.captureCount} 条`
  if (a.model) s += ` · 模型：${a.model}`
  s += '\n'
  return s
}

// 通过 background service worker 触发保存对话框，避免 content script 直接调用 downloads 不稳定。
export function downloadMarkdown(content: string, suggestedName: string): Promise<void> {
  const filename = suggestedName.endsWith('.md') ? suggestedName : `${suggestedName}.md`

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'DOWNLOAD_MARKDOWN', content, filename },
      (response?: { ok?: boolean; error?: string }) => {
        const err = chrome.runtime.lastError
        if (err) {
          reject(new Error(err.message))
          return
        }
        if (!response?.ok) {
          reject(new Error(response?.error ?? '导出失败'))
          return
        }
        resolve()
      }
    )
  })
}

// 安全的文件名（去掉 / : * ? " < > | 等）
export function safeFilename(raw: string, fallback: string = 'untitled'): string {
  const cleaned = raw.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned || fallback
}
