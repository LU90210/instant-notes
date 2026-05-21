import brief from '../prompts/brief.txt?raw'
import structured from '../prompts/structured.txt?raw'
import detailed from '../prompts/detailed.txt?raw'
import type { Capture, GenerationMode } from '../types'

// raw（原文导出）不调用 AI，由 markdown.ts 直接渲染，故返回空模板。
export function getPromptTemplate(mode: GenerationMode): string {
  switch (mode) {
    case 'brief': return brief
    case 'structured': return structured
    case 'detailed': return detailed
    case 'raw': return ''
  }
}

export function fillPrompt(template: string, vars: {
  n: number
  captures: Capture[]
  sourceUrl?: string
  displayName?: string
}): string {
  // 给每条标注「原文」或「我的想法」，让 AI 区别对待用户主动筛选的两类内容
  const capturesBlock = vars.captures
    .map((c, i) => {
      const label = c.kind === 'note' ? '我的想法' : '原文'
      return `[${i + 1}·${label}] ${c.content}`
    })
    .join('\n\n')

  return template
    .replace(/\{n\}/g, String(vars.n))
    .replace(/\{captures\}/g, capturesBlock)
    .replace(/\{source_url\}/g, vars.sourceUrl ?? '')
    .replace(/\{display_name\}/g, vars.displayName ?? '')
}
