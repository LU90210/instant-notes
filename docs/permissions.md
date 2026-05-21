# 权限说明

InstantNotes 在 `manifest.json` 声明的所有权限及其用途：

| 权限 | 用途 | 是否必需 |
|---|---|---|
| `storage` | `chrome.storage.local` 存设置（API Key、默认模型、默认模式） | 是 |
| `downloads` | `chrome.downloads.download` 触发 Markdown 文件保存对话框 | 是（导出） |
| `activeTab` | 全局快捷键触发时拿当前 tab 信息 | 是 |
| `scripting` | 未来给「全文一键入会话」用 `chrome.scripting.executeScript` 注入 Readability | v1.1 |
| `host_permissions: <all_urls>` | 允许 content script 注入到任意网站、允许 `fetch` 到 OpenRouter API | 是 |

## 我们不要这些权限

- ❌ `tabs`（不需要读所有 tabs 的 URL）
- ❌ `webRequest`（不拦截请求）
- ❌ `cookies`（不读 cookie）
- ❌ `history`（不查浏览历史）
- ❌ `identity`（不接入 Google 登录）

## 隐私承诺

- 所有捕获 / 生成数据存于浏览器本地 IndexedDB（`InstantNotes` 数据库）
- API Key 存 `chrome.storage.local`，扩展沙盒隔离
- AI 调用直连 `openrouter.ai`（用户填的 Key），**项目无后端**
- 无任何分析 / 埋点 / 第三方网络请求

## 卸载时数据去哪了

- Chrome 卸载扩展会自动清除 `chrome.storage.local`
- IndexedDB 数据通常**不会**被自动清除（依 Chrome 版本而异）。彻底清除：`chrome://settings/cookies/detail?site=chrome-extension://<extension-id>`
- 已导出的 `.md` 文件保留在你的文件系统
