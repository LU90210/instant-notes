import { useEffect, useState } from 'react'

interface Props {
  count: number
  onTap: () => void
  pulseKey: number  // 每次 +1 触发短暂放大动画
}

export function CollapsedBall({ count, onTap, pulseKey }: Props) {
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    if (pulseKey === 0) return
    setPulsing(true)
    const t = setTimeout(() => setPulsing(false), 280)
    return () => clearTimeout(t)
  }, [pulseKey])

  return (
    <div
      className={`in-ball ${pulsing ? 'in-ball-pulse' : ''}`}
      onClick={onTap}
      title={`InstantNotes · 已捕获 ${count} 条（点击展开）`}
    >
      <div className="in-ball-label">AI</div>
      <div className="in-ball-count">{count}</div>
    </div>
  )
}
