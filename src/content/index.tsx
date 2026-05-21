import React from 'react'
import { createRoot } from 'react-dom/client'
import { FloatingCard } from './FloatingCard'
import cardCss from '../styles/card.css?inline'

const HOST_ID = '__instantnotes_host__'
const POSITION_KEY = 'in_floating_position_v1'

// 通过 Shadow DOM 隔离样式，避免被宿主页面 CSS 污染
function mount() {
  if (document.getElementById(HOST_ID)) return

  const host = document.createElement('div')
  host.id = HOST_ID
  // all 会重置 position/top/right/z-index，必须先设，再逐项恢复悬浮定位。
  host.style.all = 'initial'
  host.style.display = 'block'
  host.style.position = 'fixed'
  host.style.top = '16px'
  host.style.right = '16px'
  host.style.zIndex = '2147483647'
  host.style.pointerEvents = 'none'

  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = cardCss
  shadow.appendChild(style)

  const mountNode = document.createElement('div')
  mountNode.style.pointerEvents = 'auto'
  shadow.appendChild(mountNode)

  ;(document.documentElement || document.body).appendChild(host)
  createRoot(mountNode).render(<FloatingCard host={host} positionStorageKey={POSITION_KEY} />)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true })
} else {
  mount()
}
