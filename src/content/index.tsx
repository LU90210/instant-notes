import React from 'react'
import { createRoot } from 'react-dom/client'
import { FloatingCard } from './FloatingCard'
import cardCss from '../styles/card.css?inline'

const HOST_ID = '__instantnotes_host__'

// 通过 Shadow DOM 隔离样式，避免被宿主页面 CSS 污染
function mount() {
  if (document.getElementById(HOST_ID)) return

  const host = document.createElement('div')
  host.id = HOST_ID
  host.style.cssText = [
    'position: fixed',
    'top: 16px',
    'right: 16px',
    'z-index: 2147483647',
    'pointer-events: none',
    'all: initial'
  ].join('; ')

  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = cardCss
  shadow.appendChild(style)

  const mountNode = document.createElement('div')
  mountNode.style.pointerEvents = 'auto'
  shadow.appendChild(mountNode)

  document.documentElement.appendChild(host)
  createRoot(mountNode).render(<FloatingCard />)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true })
} else {
  mount()
}
