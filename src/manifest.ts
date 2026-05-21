import { defineManifest } from '@crxjs/vite-plugin'
import pkg from '../package.json'

// Manifest V3 定义。改完之后 vite 会自动热重载。
// 图标暂缺：见 public/icons/README.md
export default defineManifest({
  manifest_version: 3,
  name: 'InstantNotes',
  version: pkg.version,
  description: '阅读现场的 AI 笔记助手。选中文字 → 快捷键 → 累积到悬浮 AI 会话 → 一键导出 Markdown。',
  // default_locale 暂不开启；用到 chrome.i18n.getMessage() 时再加 _locales/ 目录

  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'InstantNotes'
  },

  options_ui: {
    page: 'src/options/index.html',
    open_in_tab: true
  },

  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module'
  },

  content_scripts: [{
    matches: ['<all_urls>'],
    js: ['src/content/index.tsx'],
    run_at: 'document_start',
    all_frames: false
  }],

  permissions: ['storage', 'downloads', 'activeTab', 'scripting'],

  // <all_urls> 是 content_scripts 与扩展内 fetch 的前提
  host_permissions: ['<all_urls>'],

  // 注：Chrome manifest 不允许 Alt+Command 这类「双主修饰键」组合，
  // 每个 command 最多 1 个 Ctrl/Alt/Command/MacCtrl + 可选 Shift。
  // 装好后可在 chrome://extensions/shortcuts 手动改成 ⌥⌘ 等组合（recorder 比 manifest 宽松）。
  commands: {
    'silent-capture': {
      suggested_key: { default: 'Alt+Shift+C' },
      description: '捕获网页选区（不调用 AI）'
    },
    'capture-note': {
      suggested_key: { default: 'Alt+Shift+D' },
      description: '记录我的 Aha moment / 想法'
    },
    'toggle-floating': {
      suggested_key: { default: 'Alt+Shift+L' },
      description: '打开 / 收起悬浮窗'
    },
    'generate': {
      suggested_key: { default: 'Alt+Shift+S' },
      description: '终态生成 + 导出'
    }
  }
})
