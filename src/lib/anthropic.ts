import { parseSSE } from './sse'

export interface StreamOptions {
  apiKey: string
  model: string
  prompt: string
  maxTokens?: number
  signal?: AbortSignal
}

// 流式调用 Anthropic Messages API
// 注意：anthropic-dangerous-direct-browser-access 是浏览器直连必需的 opt-in header
export async function* streamAnthropic(opts: StreamOptions): AsyncGenerator<string> {
  if (!opts.apiKey) throw new Error('missing API key')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json'
    },
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
    throw new Error(`Anthropic ${response.status}: ${text}`)
  }

  for await (const evt of parseSSE(response)) {
    if (evt.data === '[DONE]') break
    try {
      const j = JSON.parse(evt.data)
      if (j.type === 'content_block_delta' && j.delta?.type === 'text_delta') {
        yield j.delta.text as string
      }
    } catch {
      // 忽略非 JSON 行
    }
  }
}

// 推荐默认值
export const DEFAULT_MODEL = 'claude-opus-4-7'
export const FAST_MODEL = 'claude-haiku-4-5-20251001'
