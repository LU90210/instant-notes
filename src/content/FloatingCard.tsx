import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from 'react'
import { CollapsedBall } from './CollapsedBall'
import { ExpandedCard } from './ExpandedCard'
import { NoteInput } from './NoteInput'
import { GeneratePanel } from './GeneratePanel'
import type { Capture, CaptureKind, Message, Session } from '../types'
import { resolveSession } from '../lib/session'
import { db } from '../lib/storage'

const VIEWPORT_MARGIN = 8
const DRAG_THRESHOLD = 4

interface Props {
  host: HTMLElement
  positionStorageKey: string
}

interface FloatingPosition {
  left: number
  top: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function clampHostPosition(host: HTMLElement, left: number, top: number): FloatingPosition {
  const rect = host.getBoundingClientRect()
  const width = rect.width || 56
  const height = rect.height || 56
  const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN)
  const maxTop = Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN)

  return {
    left: clamp(left, VIEWPORT_MARGIN, maxLeft),
    top: clamp(top, VIEWPORT_MARGIN, maxTop)
  }
}

function isFloatingPosition(value: unknown): value is FloatingPosition {
  const pos = value as Partial<FloatingPosition>
  return typeof pos?.left === 'number' && typeof pos?.top === 'number'
}

function placeHost(host: HTMLElement, left: number, top: number): FloatingPosition {
  const pos = clampHostPosition(host, left, top)
  host.style.left = `${pos.left}px`
  host.style.top = `${pos.top}px`
  host.style.right = 'auto'
  host.style.bottom = 'auto'
  return pos
}

export function FloatingCard({ host, positionStorageKey }: Props) {
  const [isExpanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(true)
  const [captures, setCaptures] = useState<Capture[]>([])
  const [pulseKey, setPulseKey] = useState(0)
  const [flashing, setFlashing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateMounted, setGenerateMounted] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const cleanupDragRef = useRef<(() => void) | null>(null)
  const ignoreNextTapRef = useRef(false)
  const collapsedPositionRef = useRef<FloatingPosition | null>(null)
  const generateVisibleRef = useRef(false)
  const generateRunningRef = useRef(false)
  const reopenGenerateOnFinishRef = useRef(false)

  const panelOpen = isExpanded || showNote || generating

  const saveCollapsedPosition = useCallback((pos: FloatingPosition) => {
    collapsedPositionRef.current = pos
    void chrome.storage.local.set({ [positionStorageKey]: pos })
  }, [positionStorageKey])

  const rememberCurrentCollapsedPosition = useCallback(() => {
    const rect = host.getBoundingClientRect()
    const pos = clampHostPosition(host, rect.left, rect.top)
    collapsedPositionRef.current = pos
    return pos
  }, [host])

  const fitHostToCurrentMode = useCallback(() => {
    const rect = host.getBoundingClientRect()
    const base = collapsedPositionRef.current ?? clampHostPosition(host, rect.left, rect.top)
    const pos = placeHost(host, base.left, base.top)
    if (!panelOpen) collapsedPositionRef.current = pos
  }, [host, panelOpen])

  useEffect(() => {
    generateVisibleRef.current = generating
  }, [generating])

  useEffect(() => {
    void chrome.storage.local.get(positionStorageKey).then((r) => {
      const saved = r[positionStorageKey]
      requestAnimationFrame(() => {
        const rect = host.getBoundingClientRect()
        const base = isFloatingPosition(saved)
          ? saved
          : clampHostPosition(host, rect.left, rect.top)
        collapsedPositionRef.current = base
        placeHost(host, base.left, base.top)
      })
    })
  }, [host, positionStorageKey])

  const collapseToBall = useCallback(() => {
    setExpanded(false)
    setShowNote(false)
    setGenerating(false)

    if (generateRunningRef.current) {
      reopenGenerateOnFinishRef.current = true
    } else {
      setGenerateMounted(false)
    }
  }, [])

  const openGeneratePanel = useCallback(() => {
    rememberCurrentCollapsedPosition()
    reopenGenerateOnFinishRef.current = false
    setExpanded(false)
    setShowNote(false)
    setGenerateMounted(true)
    setGenerating(true)
  }, [rememberCurrentCollapsedPosition])

  const toggleFloatingPanel = useCallback(() => {
    setVisible(true)

    if (visible && panelOpen) {
      collapseToBall()
      return
    }

    rememberCurrentCollapsedPosition()
    setShowNote(false)

    if (generateMounted) {
      setExpanded(false)
      setGenerating(true)
      return
    }

    setGenerating(false)
    setExpanded(true)
  }, [visible, panelOpen, generateMounted, collapseToBall, rememberCurrentCollapsedPosition])

  const onGenerateFinished = useCallback(() => {
    generateRunningRef.current = false
    if (reopenGenerateOnFinishRef.current || !generateVisibleRef.current) {
      reopenGenerateOnFinishRef.current = false
      rememberCurrentCollapsedPosition()
      setExpanded(false)
      setShowNote(false)
      setGenerateMounted(true)
      setGenerating(true)
    }
  }, [rememberCurrentCollapsedPosition])

  const onGenerateRunningChange = useCallback((running: boolean) => {
    generateRunningRef.current = running
  }, [])

  const onDragPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return

    const target = event.target as Element | null
    if (!target) return
    if (target.closest('button, input, textarea, select, a')) return
    if (!target.closest('.in-drag-handle, .in-ball')) return

    cleanupDragRef.current?.()

    const startRect = host.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    let moved = false

    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return

      moved = true
      ignoreNextTapRef.current = true
      setDragging(true)
      placeHost(host, startRect.left + dx, startRect.top + dy)
      moveEvent.preventDefault()
    }

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      cleanupDragRef.current = null
    }

    const onUp = () => {
      cleanup()
      if (moved) {
        const rect = host.getBoundingClientRect()
        saveCollapsedPosition(clampHostPosition(host, rect.left, rect.top))
      }
      setDragging(false)
      window.setTimeout(() => {
        ignoreNextTapRef.current = false
      }, 0)
    }

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp, { once: true })
    window.addEventListener('pointercancel', onUp, { once: true })
    cleanupDragRef.current = cleanup
  }, [host, saveCollapsedPosition])

  useEffect(() => () => cleanupDragRef.current?.(), [])

  useEffect(() => {
    if (pulseKey === 0) return
    setFlashing(true)
    const t = window.setTimeout(() => setFlashing(false), 560)
    return () => window.clearTimeout(t)
  }, [pulseKey])

  useEffect(() => {
    if (!visible) return
    const frame = requestAnimationFrame(fitHostToCurrentMode)
    return () => cancelAnimationFrame(frame)
  }, [visible, panelOpen, captures.length, fitHostToCurrentMode])

  useEffect(() => {
    if (!visible || !panelOpen) return

    const onOutsidePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      if (dragging) return
      if (event.composedPath().includes(host)) return

      collapseToBall()
    }

    document.addEventListener('pointerdown', onOutsidePointerDown, true)
    return () => document.removeEventListener('pointerdown', onOutsidePointerDown, true)
  }, [visible, panelOpen, dragging, host, collapseToBall])

  // 统一的捕获入口：网页原文 kind='text'，个人想法 kind='note'
  const addCapture = useCallback(async (kind: CaptureKind, content: string) => {
    if (!content.trim()) return
    const favicon = document.querySelector('link[rel~="icon"]') as HTMLLinkElement | null
    const sess = await resolveSession({
      url: location.href,
      title: document.title,
      faviconUrl: favicon?.href
    })
    setSession(sess)

    const capture: Capture = {
      id: crypto.randomUUID(),
      sessionId: sess.id,
      kind,
      content: content.trim(),
      position: captures.length,
      capturedAt: Date.now()
    }
    await db.captures.put(capture)
    setCaptures(prev => [...prev, capture])
    setPulseKey(k => k + 1)
  }, [captures.length])

  const onCaptureSelection = useCallback(async () => {
    const text = window.getSelection()?.toString() ?? ''
    await addCapture('text', text)
  }, [addCapture])

  const onDelete = useCallback(async (id: string) => {
    await db.captures.delete(id)
    setCaptures(prev => prev.filter(c => c.id !== id))
  }, [])

  const onClear = useCallback(async () => {
    if (!captures.length) return
    const ok = window.confirm('清空当前 Session 的所有捕获？清空后，下一次捕获会开启新的 Session。')
    if (!ok) return

    const captureIds = captures.map(c => c.id)
    const sessionIds = Array.from(new Set(captures.map(c => c.sessionId)))
    const endedAt = Date.now()

    await db.captures.bulkDelete(captureIds)
    await Promise.all(sessionIds.map(id => db.sessions.update(id, {
      status: 'archived',
      endedAt
    })))

    setCaptures([])
    setSession(null)
    setGenerating(false)
    setGenerateMounted(false)
    generateRunningRef.current = false
    reopenGenerateOnFinishRef.current = false
    setShowNote(false)
    setExpanded(true)
  }, [captures])

  useEffect(() => {
    const handler = (msg: Message) => {
      if (msg.type === 'CAPTURE') void onCaptureSelection()
      else if (msg.type === 'NOTE') {
        rememberCurrentCollapsedPosition()
        setShowNote(true)
      }
      else if (msg.type === 'TOGGLE_FLOATING') toggleFloatingPanel()
      else if (msg.type === 'GENERATE') openGeneratePanel()
    }
    chrome.runtime.onMessage.addListener(handler as never)
    return () => chrome.runtime.onMessage.removeListener(handler as never)
  }, [onCaptureSelection, openGeneratePanel, rememberCurrentCollapsedPosition, toggleFloatingPanel])

  if (!visible) return null

  const onCollapsedTap = () => {
    if (ignoreNextTapRef.current) {
      ignoreNextTapRef.current = false
      return
    }
    rememberCurrentCollapsedPosition()
    setExpanded(true)
  }

  const frameClassName = [
    'in-float',
    flashing ? 'in-float-flash' : '',
    dragging ? 'in-dragging' : ''
  ].filter(Boolean).join(' ')

  let body: ReactNode

  if (showNote) {
    body = (
      <NoteInput
        onSubmit={(t) => { void addCapture('note', t); collapseToBall() }}
        onCancel={collapseToBall}
      />
    )
  } else {
    body = isExpanded
      ? <ExpandedCard
          captures={captures}
          onCollapse={collapseToBall}
          onDelete={onDelete}
          onClear={onClear}
          onGenerate={openGeneratePanel}
        />
      : <CollapsedBall count={captures.length} onTap={onCollapsedTap} pulseKey={pulseKey} />
  }

  return (
    <div className={frameClassName} onPointerDown={onDragPointerDown}>
      {generating ? null : body}
      {generateMounted && (
        <div hidden={!generating}>
          <GeneratePanel
            captures={captures}
            session={session}
            onClose={collapseToBall}
            onRunningChange={onGenerateRunningChange}
            onFinished={onGenerateFinished}
          />
        </div>
      )}
    </div>
  )
}
