import { sendToActiveTab } from '../lib/messaging'
import type { CommandName, Message } from '../types'

// 全局快捷键 → 转发到当前 tab 的 content script
chrome.commands.onCommand.addListener((command) => {
  const c = command as CommandName
  switch (c) {
    case 'silent-capture':
      void sendToActiveTab({ type: 'CAPTURE' })
      break
    case 'capture-note':
      void sendToActiveTab({ type: 'NOTE' })
      break
    case 'toggle-floating':
      void sendToActiveTab({ type: 'TOGGLE_FLOATING' })
      break
    case 'generate':
      void sendToActiveTab({ type: 'GENERATE' })
      break
  }
})

chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
  if (msg.type !== 'DOWNLOAD_MARKDOWN') return

  const filename = msg.filename.endsWith('.md') ? msg.filename : `${msg.filename}.md`
  const url = `data:text/markdown;charset=utf-8,${encodeURIComponent(msg.content)}`

  chrome.downloads.download({ url, filename, saveAs: true }, () => {
    const err = chrome.runtime.lastError
    if (err) sendResponse({ ok: false, error: err.message })
    else sendResponse({ ok: true })
  })

  return true
})

// 首次安装：打开 options 页让用户填 API Key
chrome.runtime.onInstalled.addListener((info) => {
  if (info.reason === 'install') {
    chrome.runtime.openOptionsPage()
  }
})
