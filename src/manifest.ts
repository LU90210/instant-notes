import { defineManifest } from '@crxjs/vite-plugin'
import pkg from '../package.json'

// Manifest V3 定义。改完之后 vite 会自动热重载。
// 图标暂缺：见 public/icons/README.md
export default defineManifest({
  manifest_version: 3,
  name: 'InstantNotes',
  version: pkg.version,
  description: '阅读现场的 AI 笔记助手。选中文字 → 快捷键 → 累积到悬浮 AI 会话 → 一键导出 Markdown。',
  default_locale: 'zh_CN',

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
    run_at: 'document_idle',
    all_frames: false
  }],

  permissions: ['storage', 'downloads', 'activeTab', 'scripting'],

  // <all_urls> 是 content_scripts 与扩展内 fetch 的前提
  host_permissions: ['<all_urls>'],

  commands: {
    'silent-capture': {
      suggested_key: { default: 'Alt+Shift+C', mac: 'Alt+Command+C' },
      description: '静默捕获选区（不调用 AI）'
    },
    'capture-and-ask': {
      suggested_key: { default: 'Alt+Shift+A', mac: 'Alt+Command+A' },
      description: '捕获选区并立即问 AI'
    },
    'toggle-floating': {
      suggested_key: { default: 'Alt+Shift+L', mac: 'Alt+Command+L' },
      description: '唤出 / 隐藏悬浮卡'
    },
    'generate': {
      suggested_key: { default: 'Alt+Shift+S', mac: 'Alt+Command+S' },
      description: '终态生成 + 导出'
    }
  }
})
