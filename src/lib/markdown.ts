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
}

export function renderMarkdown(a: RenderArgs): string {
  let s = '---\n'
  s += `source_url: ${a.sourceUrl}\n`
  s += `captured_at: ${a.capturedAt.toISOString()}\n`
  s += `capture_count: ${a.captureCount}\n`
  s += `model: ${a.model}\n`
  s += `mode: ${a.mode}\n`
  s += '---\n\n'
  s += `# ${a.displayName}\n\n`
  s += a.aiOutput.trim()
  s += '\n'

  if (a.mode === 'combo') {
    s += '\n## 原文存档\n\n'
    for (const c of a.captures) {
      const quoted = c.content.split('\n').map(l => `> ${l}`).join('\n')
      s += `${quoted}\n\n`
    }
  }
  return s
}

// 通过 chrome.downloads 触发保存对话框
export function downloadMarkdown(content: string, suggestedName: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const filename = suggestedName.endsWith('.md') ? suggestedName : `${suggestedName}.md`
  chrome.downloads.download({ url, filename, saveAs: true }, () => {
    URL.revokeObjectURL(url)
  })
}

// 安全的文件名（去掉 / : * ? " < > | 等）
export function safeFilename(raw: string, fallback: string = 'untitled'): string {
  const cleaned = raw.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned || fallback
}
