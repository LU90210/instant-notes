import { useEffect, useState, useCallback } from 'react'
import { CollapsedBall } from './CollapsedBall'
import { ExpandedCard } from './ExpandedCard'
import type { Capture, Message } from '../types'
import { resolveSession } from '../lib/session'
import { db } from '../lib/storage'

export function FloatingCard() {
  const [isExpanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(true)
  const [captures, setCaptures] = useState<Capture[]>([])
  const [pulseKey, setPulseKey] = useState(0)

  const onCapture = useCallback(async (askAI: boolean) => {
    const text = window.getSelection()?.toString() ?? ''
    if (!text.trim()) return

    const favicon = document.querySelector('link[rel~="icon"]') as HTMLLinkElement | null
    const session = await resolveSession({
      url: location.href,
      title: document.title,
      faviconUrl: favicon?.href
    })

    const capture: Capture = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      kind: 'text',
      content: text,
      position: captures.length,
      capturedAt: Date.now()
    }
    await db.captures.put(capture)
    setCaptures(prev => [...prev, capture])
    setPulseKey(k => k + 1)
    // TODO: askAI=true 时调用 streamAnthropic 写入 aiAside
  }, [captures.length])

  useEffect(() => {
    const handler = (msg: Message) => {
      if (msg.type === 'CAPTURE') void onCapture(msg.askAI)
      else if (msg.type === 'TOGGLE_FLOATING') setVisible(v => !v)
      else if (msg.type === 'GENERATE') setExpanded(true)
    }
    chrome.runtime.onMessage.addListener(handler as never)
    return () => chrome.runtime.onMessage.removeListener(handler as never)
  }, [onCapture])

  if (!visible) return null

  return isExpanded
    ? <ExpandedCard captures={captures} onCollapse={() => setExpanded(false)} />
    : <CollapsedBall count={captures.length} onTap={() => setExpanded(true)} pulseKey={pulseKey} />
}
