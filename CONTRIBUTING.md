# 贡献指南

感谢愿意为 InstantNotes 出力。本项目欢迎各种形式的贡献。

## 我可以怎么贡献

### 不需要写代码
- **Prompt 模板**：贡献新的终态模板（详见 [docs/templates.md](docs/templates.md)）
- **README 翻译**：英 / 日 / 其它
- **网站兼容性反馈**：在常用站点（特别是 SPA / 富文本编辑器 / 各种 reader 模式）测试选区捕获，把结果反馈到 Discussions
- **使用反馈**：交互不顺、文案歧义、需求场景 —— 提 Issue

### 写 TypeScript / React
- **Bug 修复**：找 `good first issue` / `help wanted` 标签
- **新功能**：先在 Discussions 讨论方向再提 PR
- **重构**：减少 bundle 大小、content script 启动时间相关的优化

## 开发环境

- Node 18+
- npm 9+（或 pnpm，按 `corepack enable pnpm`）
- Chrome / Edge / Arc / Brave 任一最新版

```bash
git clone https://github.com/<your-handle>/instant-notes.git
cd instant-notes
npm install
npm run dev
```

然后在 `chrome://extensions/` 加载 `dist/` 目录，HMR 自动生效。

## 提交规范

- 一个 PR 解决一件事
- 提交信息中英文均可，建议遵循 [Conventional Commits](https://www.conventionalcommits.org/)（feat / fix / chore / docs / refactor）
- PR 描述包含「为什么改 / 怎么改 / 怎么测」三件套
- 涉及 UI 改动请附截图或 GIF

## 代码风格

- 默认 Prettier 格式化
- TypeScript strict mode 必须通过
- 命名优先用清晰英文，注释用中文（与现有代码一致）
- 模块边界遵循 `src/{background,content,popup,options,lib,prompts}/` 的现有划分

## Issue 与 PR 流程

1. 先在 Discussions 或现有 Issue 里搜，避免重复
2. 用对应模板提交 Issue
3. 复杂改动先讨论再写代码
4. PR 描述里链回对应 Issue

## 行为准则

遵循 [Contributor Covenant](CODE_OF_CONDUCT.md)。

## 协议

提交的代码默认按本项目 [MIT License](LICENSE) 协议分发。
