import hljs from 'highlight.js'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'

const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight: (code, lang) => {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'

      return hljs.highlight(code, { language }).value
    },
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
