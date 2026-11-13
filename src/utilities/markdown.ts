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
 * 允许原样输出的 HTML 标签白名单。
 *
 * 正文由作者本人撰写，这里只放行排版类标签；其余标签（script、style、iframe 等）
 * 一律转义成文本，既不会执行脚本，也不会因为未闭合标签把后续 DOM 吞进脚本内容里。
 */
const ALLOWED_HTML_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'br',
  'cite',
  'code',
  'del',
  'dfn',
  'em',
  'figcaption',
  'figure',
  'hr',
  'i',
  'img',
  'ins',
  'kbd',
  'mark',
  'q',
  's',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'wbr',
])

const HTML_TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^<>]*?)?\/?>/g

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * 按白名单处理原始 HTML：白名单标签原样保留，其余标签连同残缺的 `<` 一起转义成文本。
 */
const escapeUnallowedHtml = (raw: string): string => {
  let result = ''
  let lastIndex = 0

  for (const match of raw.matchAll(HTML_TAG_RE)) {
    const index = match.index ?? 0
    const tagName = match[1]?.toLowerCase() ?? ''

    result += raw.slice(lastIndex, index).replace(/</g, '&lt;')
    result += ALLOWED_HTML_TAGS.has(tagName) ? match[0] : escapeHtml(match[0])
    lastIndex = index + match[0].length
  }

  return result + raw.slice(lastIndex).replace(/</g, '&lt;')
}

marked.use({
  renderer: {
    html(token) {
      return escapeUnallowedHtml(token.text)
    },
  },
})

export const renderMarkdown = (markdown?: string | null): string => {
  if (!markdown) return ''

  return marked.parse(markdown) as string
}
