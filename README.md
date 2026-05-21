# InstantNotes

**Language / 语言**： [中文](#中文) | [English](#english)

---

## 中文

此为 MVP 版本，未来将扩展到系统级选中可入会话、视频时间点标记、图片 OCR 等支持。

InstantNotes 是一个阅读现场的 AI 笔记浏览器扩展：在网页中选中文字，按快捷键捕获到当前阅读 Session；读完后基于这些人工筛选过的内容生成结构化 Markdown 笔记，并复制或导出到你的知识库。

默认 AI 接入为 OpenRouter。捕获内容和设置本地优先保存，项目不自建后端。

### Product Definition Brief（产品定义简报）

#### 核心问题

阅读网页、文档、技术博客、论文或长文章时，真正有价值的片段和瞬间洞察很容易丢失。不是因为它们不重要，而是因为捕捉、整理、加工并入库的摩擦太高。

传统流程通常是：先高亮或复制内容，再切换到笔记工具，再组织上下文，再事后调用 AI 总结。这会打断阅读现场，也让很多原本值得保留的想法在切换工具之前就消失。

InstantNotes 的目标是降低从“看到有价值内容”到“形成可回顾笔记”的摩擦，让捕捉阅读中的 Aha moment 变成一种轻量、近乎无意识的动作。

#### 用户与场景

主要用户是正在网页中阅读、研究、查资料、看教程、读产品文档或浏览长文章的人。用户不想离开当前页面，也不想为了记录一个想法而打断阅读节奏去打开 Obsidian、Notion、Logseq 或 ChatGPT。

用户愿意做的最小动作是：选中一段文字，然后按一个快捷键。这个动作只表达一件事：这段内容值得被保留、进入当前阅读会话，并在之后交给 AI 处理。

#### 产品判断

InstantNotes 的核心理念是：把 AI 前置到阅读现场。

它不是“读完之后再整理”，而是“阅读时筛选上下文，读完即得入库笔记”。AI 不应该无差别总结整篇网页，而应该基于用户主动捕获的上下文工作。

### MVP（最小可行产品）

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

### 当前痛点

1. 界面过于简略，信息层级、交互反馈和视觉完成度仍偏 MVP。
2. 概括质量由于自主调用 API，模型不一致会导致质量和结构不一致。
3. 目前只支持 OpenRouter，尚未接入更多 Provider 或本地模型。
4. 实时 Aha moment 联想，以及「我的想法」与原文内容的结合方式还未做深度优化。

### 三档提示词

#### 精简

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

#### 正常

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

#### 详细

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

### OKR

#### Objective 1：以低摩擦捕捉阅读中的想法

- KR1：捕捉动作足够简单，选中文字后按一个快捷键即可完成捕获。
- KR2：捕捉过程不打断阅读流，不跳转页面、不打开新窗口、不强迫用户立刻整理。
- KR3：用户能在页面内看到轻量反馈，知道内容已经进入当前 Session。

#### Objective 2：把人工筛选过的上下文变成有用笔记

- KR1：AI 必须基于用户主动捕捉的内容生成笔记，而不是对整篇网页做无差别总结。
- KR2：AI 输出必须清晰、可回顾、可继续加工，并默认使用 Markdown 格式。
- KR3：系统支持至少三种终态生成方式：精简、正常、详细。
- KR4：从触发生成到 Markdown 可复制或导出的延迟足够短，让生成像阅读流程的自然收尾。

#### Objective 3：让工具可信、私密、可长期使用

- KR1：捕获与生成记录默认存储在浏览器本地 IndexedDB。
- KR2：API Key 存储在 `chrome.storage.local`，项目不自建后端，不接触用户数据。
- KR3：扩展权限保持克制，只申请实现阅读捕捉、AI 生成与 Markdown 导出所需的权限。
- KR4：未来可扩展到系统级选中入会话、视频时间点标记、图片 OCR、多 Provider 与跨浏览器支持。

### 快速开始

```bash
npm install
npm run build
```

然后打开 `chrome://extensions/`，开启「开发者模式」，选择「加载已解压的扩展程序」，加载项目的 `dist/` 目录。

首次使用时打开扩展设置页，填写 OpenRouter API Key，点击「读取 OpenRouter 模型」，选择一个模型后保存。

### 默认快捷键

| 快捷键 | 作用 |
|---|---|
| `⌥⇧C` / `Alt+Shift+C` | 捕获网页选区 |
| `⌥⇧D` / `Alt+Shift+D` | 记录我的想法 |
| `⌥⇧L` / `Alt+Shift+L` | 打开 / 收起悬浮窗 |
| `⌥⇧S` / `Alt+Shift+S` | 打开生成与导出面板 |

快捷键可在 `chrome://extensions/shortcuts` 自定义。

### 隐私

- 捕获内容默认保存在浏览器本地 IndexedDB。
- API Key 保存在 `chrome.storage.local`。
- 项目不自建后端，不接触用户数据。
- AI 请求从扩展直接发往用户配置的 OpenRouter。

---

## English

This is an MVP version. Future versions will expand toward system-level selected-text capture into sessions, video timestamp markers, image OCR, and related support.

InstantNotes is an AI note-taking browser extension for the moment of reading. Select text on any webpage, capture it into the current reading session with a shortcut, then generate a structured Markdown note from the context you intentionally selected.

The default AI provider is OpenRouter. Captures and settings are local-first, and the project does not run its own backend.

### Product Definition Brief

#### Core Problem

When reading webpages, docs, technical blogs, papers, or long articles, valuable passages and fleeting insights are easy to lose. The problem is not that they are unimportant; the problem is that capturing, organizing, processing, and saving them creates too much friction.

The traditional workflow is fragmented: highlight or copy something, switch to a note-taking app, reconstruct the context, then ask AI to summarize later. This interrupts the reading flow and lets many useful thoughts disappear before they become notes.

InstantNotes aims to reduce the friction between “this matters” and “this becomes a reusable note.”

#### User and Context

The primary user is someone reading, researching, studying docs, following tutorials, or browsing long-form content on the web. They do not want to leave the current page or break their reading rhythm just to preserve a useful thought.

The smallest acceptable action is: select a passage and press a shortcut. That action means this piece of context is worth keeping and should be available for AI-assisted synthesis later.

#### Product Thesis

InstantNotes brings AI into the reading moment.

It is not “read first, organize later.” It is “select meaningful context while reading, then finish with a ready-to-review Markdown note.” AI should not summarize an entire page indiscriminately; it should work from the context the user deliberately captured.

### MVP

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

### Current Pain Points

1. The interface is still too minimal, with MVP-level information hierarchy, interaction feedback, and visual polish.
2. Summary quality can vary because users call their own APIs and different models may produce inconsistent quality and structure.
3. Only OpenRouter is currently supported.
4. Real-time Aha moment association and the integration between personal thoughts and source content still need optimization.

### Prompt Modes

#### Brief

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

#### Normal

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

#### Detailed

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

### OKR

#### Objective 1: Capture reading thoughts with low friction

- KR1: Capturing is simple enough: select text and press one shortcut.
- KR2: Capturing does not interrupt the reading flow: no page switch, no new window, no forced immediate organization.
- KR3: Users can see lightweight in-page feedback that confirms content entered the current session.

#### Objective 2: Turn intentionally selected context into useful notes

- KR1: AI generates from user-captured content rather than indiscriminately summarizing the whole page.
- KR2: AI output is clear, reviewable, editable, and Markdown-first.
- KR3: The system supports at least three final generation modes: brief, normal, and detailed.
- KR4: Generation-to-copy/export latency is short enough to feel like a natural ending to reading.

#### Objective 3: Keep the tool trustworthy, private, and durable

- KR1: Captures and generation records are stored locally in IndexedDB by default.
- KR2: API keys are stored in `chrome.storage.local`; the project has no backend and does not touch user data.
- KR3: Extension permissions stay restrained and only cover reading capture, AI generation, and Markdown export.
- KR4: The system can later expand to system-level selected-text capture, video timestamp markers, image OCR, multiple providers, and cross-browser support.

### Quick Start

```bash
npm install
npm run build
```

Open `chrome://extensions/`, enable Developer Mode, choose “Load unpacked,” and select the `dist/` directory.

Configure your OpenRouter API key in the extension options page, load the model list, choose a model, and save.

### Default Shortcuts

| Shortcut | Action |
|---|---|
| `⌥⇧C` / `Alt+Shift+C` | Capture selected webpage text |
| `⌥⇧D` / `Alt+Shift+D` | Record a personal thought |
| `⌥⇧L` / `Alt+Shift+L` | Open / collapse the floating window |
| `⌥⇧S` / `Alt+Shift+S` | Open the generate/export panel |

Shortcuts can be customized at `chrome://extensions/shortcuts`.

### License

[MIT](LICENSE)
