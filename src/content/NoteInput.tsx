import { useEffect, useRef, useState } from 'react'

interface Props {
  onSubmit: (text: string) => void
  onCancel: () => void
}

// Aha moment 浮层输入框：留在页面内、不跳转。
// Enter 保存，Shift+Enter 换行，Esc 取消。
export function NoteInput({ onSubmit, onCancel }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  const submit = () => {
    const t = text.trim()
    if (t) onSubmit(t)
    else onCancel()
  }

  return (
    <div className="in-note">
      <div className="in-note-label in-drag-handle" title="拖动移动悬浮窗">💡 记下我的想法</div>
      <textarea
        ref={ref}
        className="in-note-input"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
          else if (e.key === 'Escape') { e.preventDefault(); onCancel() }
        }}
        placeholder="关键词 / 疑问 / 判断 / 联想…"
        rows={3}
      />
      <div className="in-note-hint">Enter 保存 · Shift+Enter 换行 · Esc 取消</div>
      <div className="in-note-actions">
        <button className="in-btn" onClick={onCancel}>取消</button>
        <button className="in-btn in-btn-primary" onClick={submit}>保存</button>
      </div>
    </div>
  )
}
