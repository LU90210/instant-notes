import { sendToActiveTab } from '../lib/messaging'
import type { CommandName } from '../types'

// 全局快捷键 → 转发到当前 tab 的 content script
chrome.commands.onCommand.addListener((command) => {
  const c = command as CommandName
  switch (c) {
    case 'silent-capture':
      void sendToActiveTab({ type: 'CAPTURE', askAI: false })
      break
    case 'capture-and-ask':
      void sendToActiveTab({ type: 'CAPTURE', askAI: true })
      break
    case 'toggle-floating':
      void sendToActiveTab({ type: 'TOGGLE_FLOATING' })
      break
    case 'generate':
      void sendToActiveTab({ type: 'GENERATE' })
      break
  }
})

// 首次安装：打开 options 页让用户填 API Key
chrome.runtime.onInstalled.addListener((info) => {
  if (info.reason === 'install') {
    chrome.runtime.openOptionsPage()
  }
})
