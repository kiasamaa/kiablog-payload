# AGENTS.md

开工前先读完本文件，再按需加载 `.agents/skills/` 下的 skill。

## 可用 Skill（`.agents/skills/`）

| Skill | 何时加载 |
|:--|:--|
| `payload` | 改动集合、字段、hook、access、endpoint、或排查 Payload 报错时。先读 `payload/SKILL.md`，细节在 `payload/reference/*.md` |
| `frontend-design` | 新建或重塑页面的视觉方向（配色、字体、版式）时 |
| `ui-ux-pro-max` | 需要具体 UI/UX 决策时：样式库、产品配色、字体配对、UX 规范、图标、图表、22 种技术栈实现。脚本需 Python 3，Windows 上用 `python` 而非 `python3` |
| `motion` | 写动画 / 过渡时（Motion for React、CSS 动画、spring 参数、性能审计） |

优先级：动内容模型 → `payload`；动视觉 → `frontend-design` + `ui-ux-pro-max`；动交互 → `motion`。三者叠加时先定结构再定视觉再定动效。