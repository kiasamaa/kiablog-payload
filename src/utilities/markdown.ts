import hljs from 'highlight.js'
import katex from 'katex'
import { Marked, type MarkedExtension } from 'marked'
import markedKatex from 'marked-katex-extension'
import { markedHighlight } from 'marked-highlight'

/**
 * 兜底规则：很多旧文章把 `$$...$$` 直接写在段落里（与上一行之间没有空行），
 * 块级 tokenizer 拿不到，这里在行内层面识别并渲染为独立公式。
 */
const katexDisplayInParagraph: MarkedExtension = {
  extensions: [
    {
      level: 'inline',
      name: 'katexDisplay',
      renderer: (token) =>
        katex.renderToString(token.text, {
          displayMode: true,
          output: 'html',
          throwOnError: false,
        }),
      start: (src) => {
        const index = src.indexOf('$$')

        return index === -1 ? undefined : index
      },
      tokenizer: (src) => {
        const match = /^\$\$([\s\S]+?)\$\$/.exec(src)

        if (!match) return undefined

        return {
          raw: match[0],
          text: match[1].trim(),
          type: 'katexDisplay',
        }
      },
    },
  ],
}

const marked = new Marked(
  katexDisplayInParagraph,
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight: (code, lang) => {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'

      return hljs.highlight(code, { language }).value
    },
  }),
  markedKatex({
    // 公式有语法错误时输出错误提示而不是抛异常，避免整篇文章渲染失败
    throwOnError: false,
    // 允许 `$公式$` 前后不写空格
    nonStandard: true,
    output: 'html',
  }),
)

marked.setOptions({
  async: false,
  breaks: true,
  gfm: true,
})

/**
 * 极简清洗：移除脚本、内联事件与 javascript: 伪协议。
 * 正文由后台管理员撰写，这里只做兜底，避免把脚本注入到前台页面。
 */
const sanitizeHtml = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')

export const renderMarkdown = (markdown?: string | null): string => {
  if (!markdown) return ''

  return sanitizeHtml(marked.parse(markdown) as string)
}
