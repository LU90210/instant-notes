# 架构

## 三层模型

```
┌──────────────────────────────────────────────┐
│           Background Service Worker          │
│  · 监听 chrome.commands（全局快捷键）        │
│  · 转发消息到 active tab 的 content script   │
│  · 首装打开 options                          │
└──────────────────────────────────────────────┘
                       │ chrome.tabs.sendMessage
                       ▼
┌──────────────────────────────────────────────┐
│      Content Script (注入每个 tab)           │
│  · 创建 Shadow DOM host，挂载 FloatingCard   │
│  · 接收 CAPTURE/TOGGLE/GENERATE 消息         │
│  · 读取 window.getSelection()                │
│  · 写入 IndexedDB（Dexie）                   │
│  · 直连 OpenRouter API（fetch + SSE）        │
└──────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│    Popup / Options（独立 React 应用）        │
│  · Popup：工具栏弹窗，显示快捷键提醒         │
│  · Options：API Key / 模型 / 默认模式        │
└──────────────────────────────────────────────┘
```

## 数据流（捕获）

```
用户按 ⌥⇧C
   ↓
service-worker.ts → chrome.commands.onCommand
   ↓ chrome.tabs.sendMessage({ type: 'CAPTURE' })
content/FloatingCard.tsx 收到消息
   ↓
window.getSelection().toString()
   ↓
resolveSession({url, title, faviconUrl})  ← 30 分钟同 URL 视为同 Session
   ↓
db.captures.put(capture)（Dexie / IndexedDB）
   ↓
setCaptures(prev => [...prev, capture])  ← React 状态更新
   ↓
小球计数 +1，触发 pulse 动画（CollapsedBall 的 pulseKey）
```

## 数据流（生成 → 导出）

```
用户按 ⌥⇧S
   ↓
content/FloatingCard 收到 GENERATE → 展开 GeneratePanel（TODO）
   ↓
用户选 mode + model + 默认目录 → fillPrompt(template, {captures, n})
   ↓
streamOpenRouter({apiKey, model, prompt}) → AsyncGenerator<string>
   ↓
逐字累积到面板，结束后 renderMarkdown() → string
   ↓
downloadMarkdown(content, suggestedName)  ← chrome.downloads.download + saveAs:true
   ↓
db.generations.put({ exportedTo: ... })
```

## 关键设计

- **Shadow DOM 隔离**：避免被宿主页面 CSS 影响（也反之），样式独立
- **`pointer-events: none` on host + `pointer-events: auto` on inner**：让卡片外的点击穿透到页面
- **`z-index: 2147483647`**：32-bit 最大正数，保证浮在所有页面元素上
- **Local-first**：IndexedDB 存所有数据；chrome.storage.local 仅存 settings；导出走 chrome.downloads
- **直连 OpenRouter**：content script 走 `https://openrouter.ai/api/v1/chat/completions`；不走 background 中转（少一次消息往返）
- **Manifest V3**：service worker（非持久 background page），事件驱动，省内存

## 已知边界

- **全屏视频**：YouTube/B 站全屏模式下页面 DOM 被 video 元素覆盖，浮卡可能不可见。v1.1 监听 `fullscreenchange` 并把 host 重新挂到 `document.fullscreenElement`
- **某些站点 CSP**：扩展自身 fetch 不受页面 CSP 限制（host_permissions 授权）；content script 的 `<script>` 注入会被页面 CSP 拦截 —— 本项目用 React + Shadow DOM 不走 inline script，免疫
- **Service Worker 唤醒**：Manifest V3 的 background 是按需启动的；快捷键 / runtime.onMessage 都会自动唤醒
