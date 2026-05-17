import type { Message } from '../types'

export function sendToActiveTab(msg: Message): Promise<unknown> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return resolve(undefined)
      chrome.tabs.sendMessage(tab.id, msg, () => {
        // 忽略 chrome.runtime.lastError（无 content script 监听是正常的）
        resolve(undefined)
      })
    })
  })
}

export function onMessage(
  handler: (msg: Message, sender: chrome.runtime.MessageSender) => void | Promise<unknown>
): void {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const result = handler(msg as Message, sender)
    if (result instanceof Promise) {
      result.then(sendResponse)
      return true
    }
  })
}
