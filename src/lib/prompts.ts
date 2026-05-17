import brief from '../prompts/brief.txt?raw'
import structured from '../prompts/structured.txt?raw'
import raw from '../prompts/raw.txt?raw'
import type { Capture, GenerationMode } from '../types'

export function getPromptTemplate(mode: GenerationMode): string {
  switch (mode) {
    case 'brief': return brief
    case 'structured': return structured
    case 'raw': return raw
    // combo 走 structured；MarkdownRenderer 会在末尾附加原文存档
    case 'combo': return structured
  }
}

export function fillPrompt(template: string, vars: {
  n: number
  captures: Capture[]
  sourceUrl?: string
  displayName?: string
}): string {
  const capturesBlock = vars.captures
    .map((c, i) => `[${i + 1}] ${c.content}`)
    .join('\n\n')

  return template
    .replace(/\{n\}/g, String(vars.n))
    .replace(/\{captures\}/g, capturesBlock)
    .replace(/\{source_url\}/g, vars.sourceUrl ?? '')
    .replace(/\{display_name\}/g, vars.displayName ?? '')
}
