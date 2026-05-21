import { useEffect, useMemo, useState } from 'react'
import { getSettings, setSettings } from '../lib/storage'
import { listOpenRouterModels, OPENROUTER_BASE_URL, type ModelInfo } from '../lib/openrouter'
import type { GenerationMode } from '../types'

export function Options() {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [mode, setMode] = useState<GenerationMode>('structured')
  const [mergeNotes, setMergeNotes] = useState(false)
  const [saved, setSaved] = useState(false)

  const [models, setModels] = useState<ModelInfo[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [modelError, setModelError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    void (async () => {
      const s = await getSettings()
      if (s.apiKey) setApiKey(s.apiKey)
      if (s.model) setModel(s.model)
      if (s.defaultMode) setMode(s.defaultMode)
      if (typeof s.mergeNotes === 'boolean') setMergeNotes(s.mergeNotes)
    })()
  }, [])

  const loadModels = async () => {
    const key = apiKey.trim()
    setModelError('')
    if (!key) {
      setModelError('先填 OpenRouter API Key，再读取模型列表')
      return
    }

    setLoadingModels(true)
    try {
      const list = await listOpenRouterModels(key)
      setModels(list)
      if (!list.length) {
        setModelError('OpenRouter 没有返回可用模型，请检查 API Key')
        return
      }
      if (!model || !list.some(m => m.id === model)) setModel(list[0].id)
    } catch (e) {
      setModelError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoadingModels(false)
    }
  }

  const onSave = async () => {
    const key = apiKey.trim()
    const selectedModel = model.trim()
    setModelError('')

    if (!key) {
      setModelError('请先填写 OpenRouter API Key')
      return
    }
    if (!selectedModel) {
      setModelError('请先读取并选择一个 OpenRouter 模型')
      return
    }

    await setSettings({
      apiKey: key,
      model: selectedModel,
      defaultMode: mode,
      mergeNotes
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const box: React.CSSProperties = {
    maxWidth: 760,
    margin: '40px auto',
    padding: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", system-ui, sans-serif'
  }
  const field: React.CSSProperties = { display: 'block', marginBottom: 20 }
  const label: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }
  const hint: React.CSSProperties = { fontSize: 12, color: '#6e6e73', marginTop: 4, lineHeight: 1.5 }
  const input: React.CSSProperties = {
    width: '100%',
    padding: 8,
    fontSize: 13,
    fontFamily: 'inherit',
    border: '1px solid #d1d1d6',
    borderRadius: 6
  }
  const btn: React.CSSProperties = {
    padding: '7px 14px',
    fontSize: 13,
    cursor: loadingModels ? 'wait' : 'pointer',
    border: '1px solid #d1d1d6',
    borderRadius: 6,
    background: '#fff'
  }
  const badge: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 32,
    padding: '0 10px',
    border: '1px solid #d1d1d6',
    borderRadius: 6,
    background: '#f5f5f7',
    fontSize: 13
  }

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return models
    return models.filter(m =>
      m.id.toLowerCase().includes(q) ||
      (m.name ?? '').toLowerCase().includes(q)
    )
  }, [filter, models])

  return (
    <div style={box}>
      <h1 style={{ marginTop: 0 }}>InstantNotes 设置</h1>

      <div style={field}>
        <label style={label}>AI 提供方</label>
        <div style={badge}>OpenRouter</div>
        <div style={hint}>
          当前只接 OpenRouter：<code>{OPENROUTER_BASE_URL}</code>
        </div>
      </div>

      <div style={field}>
        <label style={label}>OpenRouter API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => {
            setApiKey(e.target.value)
            setModels([])
            setModel('')
            setModelError('')
          }}
          placeholder="sk-or-v1-..."
          style={input}
        />
        <div style={hint}>
          仅存于 <code>chrome.storage.local</code>，本扩展无后端，不会接触你的 Key。
          {' '}Key 在 <code>openrouter.ai/keys</code> 申请。
        </div>
      </div>

      <div style={field}>
        <label style={label}>模型</label>
        <button style={btn} onClick={loadModels} disabled={loadingModels}>
          {loadingModels ? '读取中...' : '读取 OpenRouter 模型'}
        </button>
        {modelError && <div style={{ ...hint, color: '#ff3b30' }}>{modelError}</div>}

        {models.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder={`搜索模型（共 ${models.length} 个）`}
              style={{ ...input, marginBottom: 8 }}
            />
            <select
              size={10}
              value={model}
              onChange={e => setModel(e.target.value)}
              style={{ ...input, height: 'auto' }}
            >
              {filtered.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name ? `${m.name} - ${m.id}` : m.id}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={hint}>
          已选：<code>{model || '读取模型后从列表选择'}</code>
        </div>
      </div>

      <div style={field}>
        <label style={label}>默认生成档位</label>
        <select
          value={mode}
          onChange={e => setMode(e.target.value as GenerationMode)}
          style={{ ...input, width: 'auto' }}
        >
          <option value="brief">精简</option>
          <option value="structured">正常（推荐）</option>
          <option value="detailed">详细</option>
          <option value="raw">原文导出（不调用 AI）</option>
        </select>
      </div>

      <div style={field}>
        <label style={{ ...label, fontWeight: 400, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={mergeNotes}
            onChange={e => setMergeNotes(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          默认把「我的想法」融合进结构化笔记（不勾选则在结尾单列保留）
        </label>
      </div>

      <div style={field}>
        <label style={label}>快捷键</label>
        <div style={hint}>
          捕获网页选区 <code>⌥⇧C</code> · 记下我的想法 <code>⌥⇧D</code> · 打开/收起悬浮窗 <code>⌥⇧L</code> · 生成导出 <code>⌥⇧S</code>。
          可在 <code>chrome://extensions/shortcuts</code> 自定义。
        </div>
      </div>

      <button
        onClick={onSave}
        style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}
      >
        {saved ? '已保存' : '保存'}
      </button>
    </div>
  )
}
