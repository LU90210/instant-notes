# Prompt 模板自定义

## 模板位置

源文件在 `src/prompts/`：
- `brief.txt` — 简要概括
- `structured.txt` — 结构化笔记（默认）
- `raw.txt` — 保留原文 + 旁注

**MVP**：通过修改源文件并重新构建生效。
**v1.1**：Options 页加入模板编辑器，写入 `chrome.storage.local`，无需重建。

## 占位符

| 占位符 | 含义 | 是否实现 |
|---|---|---|
| `{n}` | 当前 Session 的捕获条数 | ✓ |
| `{captures}` | 全部捕获内容按序拼接，形如 `[1] ...\n\n[2] ...` | ✓ |
| `{source_url}` | 当前页 URL | ✓ |
| `{display_name}` | Session 名称（默认 = 页面标题） | ✓ |

替换由 `src/lib/prompts.ts` 的 `fillPrompt()` 完成。

## 写自定义模板的建议

1. **明确禁止幻觉**：永远在末尾写「不补充用户未捕获的事实」
2. **声明输出格式**：是 Markdown？带 frontmatter？是否要 `[[wikilinks]]`？
3. **限定长度**：避免 AI 对 200 字选区输出 5000 字「概括」
4. **保留可读性**：用 quote 块、表格、加粗，方便事后回看
5. **不要让 AI 输出 frontmatter**：工具会拼接 frontmatter，AI 输出 body 即可

## 贡献模板

如果你的模板适用于某种特定场景（论文 / 财报 / 技术博客 / 长访谈），
欢迎提 Issue（用 `template_contribution.md` 模板）分享。

## 示例：财报会议纪要模板

```
你是一位资深行业分析师。基于 {n} 条用户从财报电话会议中标注的选区，
输出一份「投研观察纪要」：

## 业绩亮点（3 条）
## 经营风险（3 条）
## 管理层口径变化（vs 上季度，若可推断）
## 分析师追问与管理层回应（要点）
## 关联标的 [[wikilinks]]

规则：
- 引用原话用 > markdown quote
- 数字必须来自原文，不要四舍五入
- 不补充选区外的事实

— 用户选区开始 —
{captures}
— 用户选区结束 —
```
