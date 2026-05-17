import { useEffect, useState } from 'react'
import { getSettings, setSettings } from '../lib/storage'
import { DEFAULT_MODEL } from '../lib/anthropic'
import type { GenerationMode } from '../types'

export function Options() {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [mode, setMode] = useState<GenerationMode>('structured')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    void (async () => {
      const s = await getSettings()
      if (s.anthropicApiKey) setApiKey(s.anthropicApiKey)
      if (s.defaultModel) setModel(s.defaultModel)
      if (s.defaultMode) setMode(s.defaultMode)
    })()
  }, [])

  const onSave = async () => {
    await setSettings({
      anthropicApiKey: apiKey.trim(),
      defaultModel: model.trim() || DEFAULT_MODEL,
      defaultMode: mode
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const box: React.CSSProperties = {
    maxWidth: 640, margin: '40px auto', padding: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", system-ui, sans-serif'
  }
  const field: React.CSSProperties = { display: 'block', marginBottom: 20 }
  const label: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }
  const hint: React.CSSProperties = { fontSize: 12, color: '#6e6e73', marginTop: 4 }
  const input: React.CSSProperties = {
    width: '100%', padding: 8, fontSize: 13, fontFamily: 'inherit',
    border: '1px solid #d1d1d6', borderRadius: 6
  }

  return (
    <div style={box}>
      <h1 style={{ marginTop: 0 }}>InstantNotes 设置</h1>

      <div style={field}>
        <label style={label}>Anthropic API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          style={input}
        />
        <div style={hint}>
          仅存于 chrome.storage.local，作者无后端，不会接触。
          {' '}<a href="https://console.anthropic.com/" target="_blank" rel="noreferrer">这里申请 →</a>
        </div>
      </div>

      <div style={field}>
        <label style={label}>默认模型</label>
        <input
          value={model}
          onChange={e => setModel(e.target.value)}
          placeholder={DEFAULT_MODEL}
          style={input}
        />
        <div style={hint}>
          推荐：<code>claude-opus-4-7</code>（高质量）/ <code>claude-haiku-4-5-20251001</code>（快/省）
        </div>
      </div>

      <div style={field}>
        <label style={label}>默认生成形式</label>
        <select
          value={mode}
          onChange={e => setMode(e.target.value as GenerationMode)}
          style={{ ...input, width: 'auto' }}
        >
          <option value="brief">简要概括</option>
          <option value="structured">结构化笔记（推荐）</option>
          <option value="raw">保留原文 + 旁注</option>
          <option value="combo">组合（结构化 + 末附原文）</option>
        </select>
      </div>

      <div style={field}>
        <label style={label}>快捷键</label>
        <div style={hint}>
          在 <code>chrome://extensions/shortcuts</code> 自定义（点开后找 InstantNotes）。
        </div>
      </div>

      <button
        onClick={onSave}
        style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}
      >
        {saved ? '已保存 ✓' : '保存'}
      </button>
    </div>
  )
}
