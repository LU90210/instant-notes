# InstantNotes

**Language / 语言**: [中文](README.md) | English

This is an MVP version. Future versions will expand toward system-level selected-text capture into sessions, video timestamp markers, image OCR, and related support.

InstantNotes is an AI note-taking browser extension for the moment of reading. Select text on any webpage, capture it into the current reading session with a shortcut, then generate a structured Markdown note from the context you intentionally selected.

The default AI provider is OpenRouter. Captures and settings are local-first, and the project does not run its own backend.

## Product Definition Brief

### Core Problem

When reading webpages, docs, technical blogs, papers, or long articles, valuable passages and fleeting insights are easy to lose. The problem is not that they are unimportant; the problem is that capturing, organizing, processing, and saving them creates too much friction.

The traditional workflow is fragmented: highlight or copy something, switch to a note-taking app, reconstruct the context, then ask AI to summarize later. This interrupts the reading flow and lets many useful thoughts disappear before they become notes.

InstantNotes aims to reduce the friction between “this matters” and “this becomes a reusable note.”

### User and Context

The primary user is someone reading, researching, studying docs, following tutorials, or browsing long-form content on the web. They do not want to leave the current page or break their reading rhythm just to preserve a useful thought.

The smallest acceptable action is: select a passage and press a shortcut. That action means this piece of context is worth keeping and should be available for AI-assisted synthesis later.

### Product Thesis

InstantNotes brings AI into the reading moment.

It is not “read first, organize later.” It is “select meaningful context while reading, then finish with a ready-to-review Markdown note.” AI should not summarize an entire page indiscriminately; it should work from the context the user deliberately captured.

## MVP

The smallest magical version should include:

- Web selection capture with `⌥⇧C` / `Alt+Shift+C`.
- Personal thoughts with `⌥⇧D` / `Alt+Shift+D`.
- A floating ball and floating window showing the current session count.
- Direct open/collapse for the floating window with `⌥⇧L` / `Alt+Shift+L`.
- Truncated long previews with per-item and global expand/collapse controls.
- Automatic session grouping by URL and time window.
- OpenRouter setup with API key storage, model loading, and model selection.
- Brief, normal, detailed, and raw Markdown output modes.
- Copy and `.md` export for the final note.
- Local-first storage via IndexedDB and `chrome.storage.local`.

## Current Pain Points

1. The interface is still too minimal, with MVP-level information hierarchy, interaction feedback, and visual polish.
2. Summary quality can vary because users call their own APIs and different models may produce inconsistent quality and structure.
3. Only OpenRouter is currently supported.
4. Real-time Aha moment association and the integration between personal thoughts and source content still need optimization.

## Prompt Modes

### Brief

```txt
你是我的阅读笔记助手。请只基于下面捕获的 {n} 条网页原文和「我的想法」，生成一份精简的结构化概括。

要求：
- 不要引入未提供的信息
- 不要逐条机械复述
- 保留重要原文含义，也保留我的想法、判断和问题
- 用一句话说明核心内容
- 再列出 3-5 个关键点，只保留最重要的信息
- 输出 Markdown 正文，frontmatter 由工具拼接，不要重复输出

— 用户捕获内容开始 —
{captures}
— 用户捕获内容结束 —
```

### Normal

```txt
你是我的阅读笔记助手。请只基于下面捕获的 {n} 条网页原文和「我的想法」，生成一份正常长度的结构化概括。

要求：
- 不要引入未提供的信息
- 不要逐条机械复述
- 保留重要原文含义，也保留我的想法、判断和问题
- 按主题归纳内容，用清晰的小标题和要点组织
- 如果有「我的想法」，把它自然融合到相关主题里
- 输出 Markdown 正文，frontmatter 由工具拼接，不要重复输出

— 用户捕获内容开始 —
{captures}
— 用户捕获内容结束 —
```

### Detailed

```txt
你是我的阅读笔记助手。请只基于下面捕获的 {n} 条网页原文和「我的想法」，生成一份较详细的结构化概括。

要求：
- 不要引入未提供的信息
- 不要逐条机械复述
- 保留重要原文含义，也保留我的想法、判断和问题
- 按主题展开，说明关键信息之间的关系
- 保留值得回看的重要细节，但不要为了变长而重复
- 整理出我的想法、疑问和可以继续追问的方向
- 输出 Markdown 正文，frontmatter 由工具拼接，不要重复输出

— 用户捕获内容开始 —
{captures}
— 用户捕获内容结束 —
```

## OKR

### Objective 1: Capture reading thoughts with low friction

- KR1: Capturing is simple enough: select text and press one shortcut.
- KR2: Capturing does not interrupt the reading flow: no page switch, no new window, no forced immediate organization.
- KR3: Users can see lightweight in-page feedback that confirms content entered the current session.

### Objective 2: Turn intentionally selected context into useful notes

- KR1: AI generates from user-captured content rather than indiscriminately summarizing the whole page.
- KR2: AI output is clear, reviewable, editable, and Markdown-first.
- KR3: The system supports at least three final generation modes: brief, normal, and detailed.
- KR4: Generation-to-copy/export latency is short enough to feel like a natural ending to reading.

### Objective 3: Keep the tool trustworthy, private, and durable

- KR1: Captures and generation records are stored locally in IndexedDB by default.
- KR2: API keys are stored in `chrome.storage.local`; the project has no backend and does not touch user data.
- KR3: Extension permissions stay restrained and only cover reading capture, AI generation, and Markdown export.
- KR4: The system can later expand to system-level selected-text capture, video timestamp markers, image OCR, multiple providers, and cross-browser support.

## Quick Start

```bash
npm install
npm run build
```

Open `chrome://extensions/`, enable Developer Mode, choose “Load unpacked,” and select the `dist/` directory.

Configure your OpenRouter API key in the extension options page, load the model list, choose a model, and save.

## Default Shortcuts

| Shortcut | Action |
|---|---|
| `⌥⇧C` / `Alt+Shift+C` | Capture selected webpage text |
| `⌥⇧D` / `Alt+Shift+D` | Record a personal thought |
| `⌥⇧L` / `Alt+Shift+L` | Open / collapse the floating window |
| `⌥⇧S` / `Alt+Shift+S` | Open the generate/export panel |

Shortcuts can be customized at `chrome://extensions/shortcuts`.

## Privacy

- Captured content is stored locally in browser IndexedDB by default.
- API keys are stored in `chrome.storage.local`.
- The project has no backend and does not touch user data.
- AI requests are sent directly from the extension to the user-configured OpenRouter endpoint.

## License

[MIT](LICENSE)
