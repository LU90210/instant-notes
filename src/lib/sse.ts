export interface SSEEvent {
  event?: string
  data: string
}

// 把 fetch Response body 解析成 SSE 事件流
export async function* parseSSE(response: Response): AsyncGenerator<SSEEvent> {
  if (!response.body) return
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  let eventName: string | undefined
  let dataLines: string[] = []

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += value

      let idx: number
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx).replace(/\r$/, '')
        buffer = buffer.slice(idx + 1)

        if (line === '') {
          if (dataLines.length) {
            yield { event: eventName, data: dataLines.join('\n') }
          }
          eventName = undefined
          dataLines = []
          continue
        }
        if (line.startsWith(':')) continue
        const colon = line.indexOf(':')
        if (colon === -1) continue
        const field = line.slice(0, colon)
        let val = line.slice(colon + 1)
        if (val.startsWith(' ')) val = val.slice(1)
        if (field === 'event') eventName = val
        else if (field === 'data') dataLines.push(val)
      }
    }
    if (dataLines.length) {
      yield { event: eventName, data: dataLines.join('\n') }
    }
  } finally {
    reader.releaseLock()
  }
}
