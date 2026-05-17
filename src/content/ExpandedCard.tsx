import type { Capture } from '../types'

interface Props {
  captures: Capture[]
  onCollapse: () => void
}

export function ExpandedCard({ captures, onCollapse }: Props) {
  return (
    <div className="in-card">
      <div className="in-card-header">
        <span className="in-card-title">AI Session · {captures.length}</span>
        <button className="in-icon-btn" onClick={onCollapse} title="折叠">−</button>
      </div>

      <div className="in-card-list">
        {captures.length === 0 ? (
          <div className="in-empty">还没有捕获，按 ⌥⇧C 试试</div>
        ) : captures.map((c, i) => (
          <div key={c.id} className="in-capture">
            <div className="in-capture-index">{i + 1}.</div>
            <div className="in-capture-content">
              {c.content}
              {c.aiAside && <div className="in-aside">AI: {c.aiAside}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="in-card-footer">
        <button className="in-btn">提问</button>
        <button
          className="in-btn in-btn-primary"
          disabled={captures.length === 0}
          // TODO: 触发 GeneratePanel
        >
          生成
        </button>
      </div>
    </div>
  )
}
