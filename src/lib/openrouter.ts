import { parseSSE } from './sse'

export interface OpenRouterStreamOptions {
  apiKey: string
  model: string
  prompt: string
  maxTokens?: number
  signal?: AbortSignal
}

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

function openRouterHeaders(apiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'HTTP-Referer': chrome.runtime.getURL(''),
    'X-OpenRouter-Title': 'InstantNotes'
  }
  if (apiKey) headers.authorization = `Bearer ${apiKey}`
  return headers
}

// 流式调用 OpenRouter 的 /chat/completions 接口。
export async function* streamOpenRouter(opts: OpenRouterStreamOptions): AsyncGenerator<string> {
  if (!opts.apiKey) throw new Error('missing API key')

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: openRouterHeaders(opts.apiKey),
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 4096,
      stream: true,
      messages: [{ role: 'user', content: opts.prompt }]
    }),
    signal: opts.signal
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`API ${response.status}: ${text}`)
  }

  for await (const evt of parseSSE(response)) {
    if (evt.data === '[DONE]') break
    try {
      const j = JSON.parse(evt.data)
      const delta = j.choices?.[0]?.delta?.content
      if (typeof delta === 'string') yield delta
    } catch {
      // 忽略非 JSON 行
    }
  }
}

export interface ModelInfo {
  id: string
  name?: string
  contextLength?: number
}

export async function listOpenRouterModels(apiKey: string): Promise<ModelInfo[]> {
  const res = await fetch(`${OPENROUTER_BASE_URL}/models?output_modalities=text`, {
    headers: openRouterHeaders(apiKey)
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`拉取模型失败 ${res.status}: ${t}`)
  }
  const j = await res.json()
  const arr: unknown[] = Array.isArray(j?.data) ? j.data : []
  return arr
    .map((m): ModelInfo => {
      const o = m as { id?: unknown; name?: unknown; context_length?: unknown }
      return {
        id: String(o.id ?? ''),
        name: o.name ? String(o.name) : undefined,
        contextLength: typeof o.context_length === 'number' ? o.context_length : undefined
      }
    })
    .filter(m => m.id)
    .sort((a, b) => a.id.localeCompare(b.id))
}
