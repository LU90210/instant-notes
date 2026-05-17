# 图标资源

需要三个尺寸的 PNG 图标：

- `16.png` — 工具栏小图标
- `48.png` — 扩展管理页
- `128.png` — Chrome Web Store / 上架

## 临时方案

未提供图标时 Chrome 会使用默认拼图图标。

## 生成方法

1. 设计 SVG（建议 512x512），导出三种尺寸 PNG
2. 或用现成工具：[realfavicongenerator.net](https://realfavicongenerator.net/)
3. 放到本目录后，在 `src/manifest.ts` 取消注释 `icons` 字段：
   ```ts
   icons: {
     16: 'public/icons/16.png',
     48: 'public/icons/48.png',
     128: 'public/icons/128.png'
   }
   ```

## 设计建议

主色：`#007aff`（系统蓝）或 `#1c1c1e`（深灰）
风格：扁平 / 几何 / 与「AI 浮球」呼应
免费图标库：[Phosphor](https://phosphoricons.com/) / [Lucide](https://lucide.dev/)
