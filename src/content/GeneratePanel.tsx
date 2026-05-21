import { useEffect, useRef, useState } from 'react'
import type { Capture, GenerationMode, Session } from '../types'
import { getSettings } from '../lib/storage'
import { streamOpenRouter } from '../lib/openrouter'
import { getPromptTemplate, fillPrompt } from '../lib/prompts'
import { renderMarkdown, downloadMarkdown, safeFilename } from '../lib/markdown'

const MODES: { value: GenerationMode; label: string }[] = [
  { value: 'brief', label: '精简' },
  { value: 'structured', label: '正常' },
  { value: 'detailed', label: '详细' },
  { value: 'raw', label: '原文导出' }
]

interface Props {
  captures: Capture[]
  session: Session | null
  onClose: () => void
  onRunningChange?: (running: boolean) => void
  onFinished?: () => void
}

export function GeneratePanel({ captures, session, onClose, onRunningChange, onFinished }: Props) {
  const [mode, setMode] = useState<GenerationMode>('structured')
  const [mergeNotes, setMergeNotes] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [markdown, setMarkdown] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const runningRef = useRef(false)

  const hasNotes = captures.some(c => c.kind === 'note')

  useEffect(() => {
    void (async () => {
      const s = await getSettings()
      if (s.defaultMode) setMode(s.defaultMode)
      if (typeof s.mergeNotes === 'boolean') setMergeNotes(s.mergeNotes)
    })()
  }, [])

  useEffect(() => {
    setMarkdown('')
    setOutput('')
    setError('')
    setStatus('')
  }, [mode, mergeNotes, captures])

  const meta = {
    displayName: session?.displayName ?? document.title,
    sourceUrl: session?.sourceUrl ?? location.href,
    capturedAt: new Date(),
    captureCount: captures.length
  }

  const copyMarkdown = async (content: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content)
      return
    }

    const textarea = document.createElement('textarea')
    textarea.value = content
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand('copy')
    textarea.remove()
    if (!ok) throw new Error('复制失败，请手动选择生成结果复制')
  }

  const buildMarkdown = async (): Promise<string> => {
    const s = await getSettings()
    let aiOutput = ''

    if (mode !== 'raw') {
      if (!s.apiKey) throw new Error('未配置 OpenRouter API Key，请先在扩展设置里填写')
      if (!s.model) throw new Error('未选择 OpenRouter 模型，请先在扩展设置里读取并选择模型')
      // mergeNotes=true：个人想法一起喂给 AI；false：只喂原文，想法稍后单列
      const promptCaps = mergeNotes ? captures : captures.filter(c => c.kind === 'text')
      if (promptCaps.length === 0) throw new Error('没有可用于生成的内容')

      const prompt = fillPrompt(getPromptTemplate(mode), {
        n: promptCaps.length,
        captures: promptCaps,
        sourceUrl: meta.sourceUrl,
        displayName: meta.displayName
      })

      const stream = streamOpenRouter({
        apiKey: s.apiKey,
        model: s.model,
        prompt
      })

      for await (const chunk of stream) {
        aiOutput += chunk
        setOutput(prev => prev + chunk)
      }
    }

    return renderMarkdown({
        displayName: meta.displayName,
        sourceUrl: meta.sourceUrl,
        capturedAt: meta.capturedAt,
        captureCount: meta.captureCount,
        model: mode === 'raw' ? '' : (s.model ?? ''),
        mode,
        aiOutput,
        captures,
        mergeNotes
      })
  }

  const run = async (action: 'copy' | 'download') => {
    if (runningRef.current) return
    runningRef.current = true
    setError('')
    setStatus('')
    setRunning(true)
    onRunningChange?.(true)

    try {
      let md = markdown
      const hadMarkdown = Boolean(md)
      if (!md) {
        setOutput('')
        md = await buildMarkdown()
        setMarkdown(md)
      }

      if (action === 'copy') {
        try {
          await copyMarkdown(md)
          setStatus('已复制 Markdown')
        } catch (copyError) {
          if (!hadMarkdown) {
            setStatus('已生成 Markdown，请再点一次「复制 Markdown」')
          } else {
            throw copyError
          }
        }
      } else {
        await downloadMarkdown(md, safeFilename(meta.displayName, 'instantnotes-note'))
        setStatus('已触发下载')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
      runningRef.current = false
      onRunningChange?.(false)
      onFinished?.()
    }
  }

  return (
    <div className="in-card">
      <div className="in-card-header in-drag-handle" title="拖动移动悬浮窗">
        <span className="in-card-title">生成笔记 · {captures.length} 条</span>
        <button className="in-icon-btn" onClick={onClose} title="返回">−</button>
      </div>

      <div className="in-gen-body">
        <div className="in-gen-modes">
          {MODES.map(m => (
            <button
              key={m.value}
              className={`in-chip ${mode === m.value ? 'in-chip-active' : ''}`}
              onClick={() => setMode(m.value)}
              disabled={running}
            >{m.label}</button>
          ))}
        </div>

        {mode !== 'raw' && hasNotes && (
          <label className="in-gen-merge">
            <input
              type="checkbox"
              checked={mergeNotes}
              onChange={e => setMergeNotes(e.target.checked)}
              disabled={running}
            />
            把我的想法融合进笔记（不勾选则单列保留）
          </label>
        )}

        {mode === 'raw' && (
          <div className="in-gen-tip">原文导出不调用 AI，直接保存你捕获的原文与想法。</div>
        )}

        {output && <div className="in-gen-output">{output}</div>}
        {error && <div className="in-gen-error">{error}</div>}
        {status && <div className="in-gen-done">{status}</div>}
      </div>

      <div className="in-card-footer in-gen-footer">
        <button className="in-btn" onClick={onClose} disabled={running}>返回</button>
        <button
          className="in-btn"
          onClick={() => { void run('copy') }}
          disabled={running || captures.length === 0}
        >
          {running ? '处理中…' : (markdown ? '复制 Markdown' : '生成并复制')}
        </button>
        <button
          className="in-btn in-btn-primary"
          onClick={() => { void run('download') }}
          disabled={running || captures.length === 0}
        >
          {running ? '处理中…' : (markdown ? '导出 .md' : (mode === 'raw' ? '导出 .md' : '生成并导出'))}
        </button>
      </div>
    </div>
  )
}
