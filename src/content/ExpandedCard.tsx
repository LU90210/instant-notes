import { useEffect, useMemo, useState } from 'react'
import type { Capture } from '../types'

const MAX_CAPTURE_PREVIEW_CHARS = 180

interface Props {
  captures: Capture[]
  onCollapse: () => void
  onDelete: (id: string) => void
  onClear: () => void
  onGenerate: () => void
}

function capturePreview(content: string): string {
  const compact = content.replace(/\s+/g, ' ').trim()
  if (compact.length <= MAX_CAPTURE_PREVIEW_CHARS) return compact
  return `${compact.slice(0, MAX_CAPTURE_PREVIEW_CHARS).trimEnd()}...`
}

function isLongCapture(content: string): boolean {
  return content.replace(/\s+/g, ' ').trim().length > MAX_CAPTURE_PREVIEW_CHARS
}

export function ExpandedCard({ captures, onCollapse, onDelete, onClear, onGenerate }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const longCaptureIds = useMemo(
    () => captures.filter(c => isLongCapture(c.content)).map(c => c.id),
    [captures]
  )
  const allExpanded = longCaptureIds.length > 0 && longCaptureIds.every(id => expandedIds.has(id))

  useEffect(() => {
    const ids = new Set(captures.map(c => c.id))
    setExpandedIds(prev => {
      const next = new Set(Array.from(prev).filter(id => ids.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [captures])

  const toggleOne = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (allExpanded) {
        for (const id of longCaptureIds) next.delete(id)
      } else {
        for (const id of longCaptureIds) next.add(id)
      }
      return next
    })
  }

  return (
    <div className="in-card">
      <div className="in-card-header in-drag-handle" title="拖动移动悬浮窗">
        <span className="in-card-title">本次 Session · {captures.length} 条</span>
        <div className="in-card-actions">
          <button
            className="in-header-toggle"
            onClick={toggleAll}
            disabled={longCaptureIds.length === 0}
            title={allExpanded ? '收起所有长文本' : '展开所有长文本'}
          >
            {allExpanded ? '全部收起' : '全部展开'}
          </button>
          <button className="in-icon-btn" onClick={onCollapse} title="折叠">−</button>
        </div>
      </div>

      <div className="in-card-list">
        {captures.length === 0 ? (
          <div className="in-empty">还没有捕获。选中网页文字按 ⌥⇧C，或按 ⌥⇧D 记下你的想法</div>
        ) : captures.map((c, i) => {
          const isExpanded = expandedIds.has(c.id)
          const isLong = isLongCapture(c.content)
          const preview = isExpanded ? c.content.trim() : capturePreview(c.content)
          return (
            <div key={c.id} className={`in-capture ${c.kind === 'note' ? 'in-capture-note' : ''}`}>
              <div className="in-capture-tag">{c.kind === 'note' ? '💡' : i + 1}</div>
              <div className="in-capture-content" title={c.content}>
                {c.kind === 'note' && <span className="in-capture-kind">我的想法</span>}
                <span className={`in-capture-preview ${isExpanded ? 'in-capture-preview-expanded' : ''}`}>{preview}</span>
                {c.aiAside && <div className="in-aside">AI：{capturePreview(c.aiAside)}</div>}
              </div>
              {isLong && (
                <button
                  className="in-text-toggle"
                  onClick={() => toggleOne(c.id)}
                  title={isExpanded ? '收起这段文字' : '展开这段文字'}
                >
                  {isExpanded ? '收起' : '展开'}
                </button>
              )}
              <button
                className="in-del-btn"
                onClick={() => onDelete(c.id)}
                title="删除这条"
              >×</button>
            </div>
          )
        })}
      </div>

      <div className="in-card-footer">
        <button
          className="in-btn in-btn-danger"
          disabled={captures.length === 0}
          onClick={onClear}
        >
          清空
        </button>
        <button
          className="in-btn in-btn-primary"
          disabled={captures.length === 0}
          onClick={onGenerate}
        >
          生成笔记
        </button>
      </div>
    </div>
  )
}
