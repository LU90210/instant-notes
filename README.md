# InstantNotes（浏览器扩展）

> 中文默认 · English version below

InstantNotes 是一个阅读现场的 AI 笔记浏览器扩展：在网页中选中文字，按快捷键捕获到当前阅读 Session；读完后基于这些人工筛选过的内容生成结构化 Markdown 笔记，并复制或导出到你的知识库。

默认 AI 接入为 OpenRouter。捕获内容和设置本地优先保存，项目不自建后端。

## Product Definition Brief（产品定义简报）

### 核心问题

阅读网页、文档、技术博客、论文或长文章时，真正有价值的片段和瞬间洞察很容易丢失。不是因为它们不重要，而是因为捕捉、整理、加工并入库的摩擦太高。

传统流程通常是：先高亮或复制内容，再切换到笔记工具，再组织上下文，再事后调用 AI 总结。这会打断阅读现场，也让很多原本值得保留的想法在切换工具之前就消失。

InstantNotes 的目标是降低从“看到有价值内容”到“形成可回顾笔记”的摩擦，让捕捉阅读中的 Aha moment 变成一种轻量、近乎无意识的动作。

### 用户与场景

主要用户是正在网页中阅读、研究、查资料、看教程、读产品文档或浏览长文章的人。用户不想离开当前页面，也不想为了记录一个想法而打断阅读节奏去打开 Obsidian、Notion、Logseq 或 ChatGPT。

用户愿意做的最小动作是：选中一段文字，然后按一个快捷键。这个动作只表达一件事：这段内容值得被保留、进入当前阅读会话，并在之后交给 AI 处理。

### 产品判断

InstantNotes 的核心理念是：把 AI 前置到阅读现场。

它不是“读完之后再整理”，而是“阅读时筛选上下文，读完即得入库笔记”。AI 不应该无差别总结整篇网页，而应该基于用户主动捕获的上下文工作。

## MVP（最小可行产品）

一个仍然让人感觉像魔法的最小版本应该做到：

- 网页选区捕获：选中文字后按 `⌥⇧C` / `Alt+Shift+C`，内容进入当前 Session。
- 我的想法：按 `⌥⇧D` / `Alt+Shift+D`，在当前页面快速记录自己的判断、疑问或 Aha moment。
- 悬浮反馈：页面中有轻量浮球和悬浮窗，显示当前 Session 已捕获数量。
- 打开/收起悬浮窗：按 `⌥⇧L` / `Alt+Shift+L`，直接打开或收起悬浮窗。
- 可控预览：长捕获默认截断，单条可展开/收起，也可一键全部展开/收起。
- Session 自动归属：按页面 URL 与时间窗口自动把捕获内容聚合到同一会话。
- OpenRouter 生成：填写 OpenRouter API Key 后读取模型列表，选择模型生成笔记。
- 多种输出：支持精简、正常、详细三档结构化概括，以及不调用 AI 的原文导出。
- Markdown 交付：生成结果可复制，也可导出为 `.md` 文件，便于进入 Obsidian、Logseq 或其他知识库。
- Local-first：捕获记录保存在 IndexedDB，API Key 保存在 `chrome.storage.local`。

## 快速开始

```bash
npm install
npm run build
```

然后打开 `chrome://extensions/`，开启「开发者模式」，选择「加载已解压的扩展程序」，加载项目的 `dist/` 目录。

首次使用时打开扩展设置页，填写 OpenRouter API Key，点击「读取 OpenRouter 模型」，选择一个模型后保存。

## 默认快捷键

| 快捷键 | 作用 |
|---|---|
| `⌥⇧C` / `Alt+Shift+C` | 捕获网页选区 |
| `⌥⇧D` / `Alt+Shift+D` | 记录我的想法 |
| `⌥⇧L` / `Alt+Shift+L` | 打开 / 收起悬浮窗 |
| `⌥⇧S` / `Alt+Shift+S` | 打开生成与导出面板 |

快捷键可在 `chrome://extensions/shortcuts` 自定义。

## 隐私

- 捕获内容默认保存在浏览器本地 IndexedDB。
- API Key 保存在 `chrome.storage.local`。
- 项目不自建后端，不接触用户数据。
- AI 请求从扩展直接发往用户配置的 OpenRouter。

## 开发脚本

```bash
npm run build
npm run dev
npm run typecheck
```

## License

[MIT](LICENSE)

---

# InstantNotes (Chrome Extension)

InstantNotes is an AI note-taking browser extension for the moment of reading. Select text on any webpage, capture it into the current reading session with a shortcut, then generate a structured Markdown note from the context you intentionally selected.

The default AI provider is OpenRouter. Captures and settings are local-first, and the project does not run its own backend.

## Product Definition Brief

### Core Problem

When reading webpages, docs, technical blogs, papers, or long articles, valuable passages and fleeting insights are easy to lose. The problem is not that they are unimportant; the problem is that capturing, organizing, processing, and saving them creates too much friction.

The traditional workflow is fragmented: highlight or copy something, switch to a note-taking app, reconstruct the context, then ask AI to summarize later. This interrupts the reading flow and lets many useful thoughts disappear before they become notes.

InstantNotes aims to reduce the friction between “this matters” and “this becomes a reusable note.”

### User and Context

The primary user is someone reading, researching, studying docs, following tutorials, or browsing long-form content on the web. They do not want to leave the current page or break their reading rhythm just to preserve a useful thought.

The smallest acceptable action is: select a passage and press a shortcut. That action means: this piece of context is worth keeping and should be available for AI-assisted synthesis later.

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
