export function Popup() {
  const style: React.CSSProperties = {
    width: 280,
    padding: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif'
  }

  return (
    <div style={style}>
      <h3 style={{ margin: '0 0 8px' }}>InstantNotes</h3>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6e6e73' }}>
        在任何网页选中文字，按下方快捷键即可捕获到悬浮 AI 会话。
      </p>
      <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 12, lineHeight: 1.6 }}>
        <li><kbd>⌥⇧C</kbd> / Alt+Shift+C 静默捕获</li>
        <li><kbd>⌥⇧A</kbd> / Alt+Shift+A 捕获并问 AI</li>
        <li><kbd>⌥⇧L</kbd> / Alt+Shift+L 唤出 / 隐藏卡片</li>
        <li><kbd>⌥⇧S</kbd> / Alt+Shift+S 生成 + 导出</li>
      </ul>
      <button
        style={{ width: '100%', padding: 8, cursor: 'pointer' }}
        onClick={() => chrome.runtime.openOptionsPage()}
      >
        打开设置
      </button>
    </div>
  )
}
