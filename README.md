# InstantNotes（浏览器扩展）

> 阅读现场的 AI 笔记助手。选中文字 → 快捷键 → 累积到悬浮 AI 会话 → 一键导出 Markdown 入库。

<!-- TODO: 录制 Demo GIF -->

## 它是什么

在任何网页里选中文字按 `⌥⌘C`，文字加入页面右上角的浮动 AI 会话；读完按 `⌥⌘S`，AI 基于你**人工筛选过的上下文**输出结构化笔记 / 简要概括 / 原文存档，保存为 Markdown 文件到你选的目录（首选 Obsidian / Logseq vault）。

**核心理念**：别人是「读 → 同步 → 在 KB 里调 AI」，本项目是「读的同时筛选喂 AI → 读完即得入库笔记」。把工作流从**三步异步**压缩成**一步同步**。

## 与同类的差异

| 项目 | 它做什么 | InstantNotes 差异 |
|---|---|---|
| Readwise / Cubox / Heptabase | 高亮 → 同步 KB | AI 是核心而非附属；不挑 KB |
| Notion AI / Obsidian Copilot | KB 内对已存笔记做 AI | 把 AI **前置到阅读现场**，不是事后处理 |
| Glasp / MyMind | 浏览器高亮 + AI 卡片 | 多次累积成上下文，读完一次性产出长形态笔记 |
| ChatGPT Web 选区问 | 单次问答 | 累积上下文 + 终态多模式生成 + 导出到 KB |

## 安装

> 当前处于早期开发，未发布到 Chrome Web Store。

### 从源码开发模式安装
1. 克隆并构建
   ```bash
   git clone https://github.com/<your-handle>/instant-notes.git
   cd instant-notes
   npm install
   npm run build
   ```
2. 打开 `chrome://extensions/` → 开启「开发者模式」→ 点「加载已解压的扩展程序」→ 选择 `dist/` 目录
3. 浏览器工具栏出现 InstantNotes 图标后，访问任意网页验证

### 开发模式（HMR）
```bash
npm run dev
```
和「加载已解压」配合，content script / popup / options 都支持热更新。

## 首次使用（3 步）

1. **填 API Key**：扩展图标 → 设置 → 粘贴你的 Anthropic Key（[这里申请](https://console.anthropic.com/)）
2. **检查快捷键**（可选改）：`chrome://extensions/shortcuts`
3. 访问任意网页，选中文字按 `⌥⌘C`，右上角浮球计数 +1

## 快捷键

| 快捷键（macOS） | 默认（其它） | 作用 |
|---|---|---|
| `⌥⌘C` | `Alt+Shift+C` | 静默捕获选中文字（仅入队列） |
| `⌥⌘A` | `Alt+Shift+A` | 捕获并立即问 AI |
| `⌥⌘L` | `Alt+Shift+L` | 唤出 / 隐藏悬浮卡 |
| `⌥⌘S` | `Alt+Shift+S` | 终态生成 + 导出 |

均可在 `chrome://extensions/shortcuts` 自定义。

## 隐私

- **所有捕获、生成记录均存于浏览器本地 IndexedDB**
- **API Key 存 `chrome.storage.local`**（扩展沙盒隔离）
- **AI 调用直连 Anthropic**，作者不接触你的数据，**项目无后端**
- **无任何分析 / 埋点 / 第三方网络请求**

## 自定义 Prompt 模板

设置页有三种终态模板（简要 / 结构化 / 原文 + 旁注），可直接编辑。占位符 `{captures}` `{n}` 等说明见 [docs/templates.md](docs/templates.md)。

## 路线图

### MVP（v0.1.0，约 1-2 周）
- 网页选区捕获 + 浮球计数（Shadow DOM 隔离样式）
- 可拖拽 / 折叠悬浮卡
- 全局快捷键四件套
- Session 自动归属（按 tab URL + 时间窗口）
- 三种终态生成（BYOK Anthropic 流式）
- 导出 `.md` 通过 `chrome.downloads`

### v1.1（+1 周）
- 全文一键入会话（[@mozilla/readability](https://github.com/mozilla/readability)）
- 视频时间点标记（YouTube / Bilibili 拿 `currentTime`）
- 图片 OCR（Tesseract.js 本地）
- Session 历史与重开

### v2（+2 周）
- 视频关键帧抽取（canvas 抓 video frame）
- 多 Provider（OpenAI / Gemini / Ollama via fetch）
- Firefox 移植（webextension-polyfill）

### v3
- Safari 扩展（需 Xcode，单独分支）
- iOS Safari 扩展

## 贡献

欢迎贡献！特别欢迎：
- **Prompt 模板贡献**（最低门槛，无需 JS/TS）
- **README 翻译**（英文 / 日文 / 其它）
- **网站兼容性测试**（在你常用的站点验证 Shadow DOM 注入与选区捕获）
- **Bug 修复 / Bug 复现**

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 协议

[MIT](LICENSE) — 自由 fork、商用、修改。

## 致谢

- [@crxjs/vite-plugin](https://github.com/crxjs/chrome-extension-tools) — Manifest V3 + Vite + HMR
- [Dexie](https://dexie.org/) — IndexedDB 封装
- [@mozilla/readability](https://github.com/mozilla/readability) — 正文抽取
- Anthropic Claude — 默认 AI Provider
