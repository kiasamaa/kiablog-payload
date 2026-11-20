/**
 * 后台 Markdown 导入用的 front matter 解析。
 * 遵循 Hexo 风格的 front matter 规则，并额外兼容键名大小写、
 * 中划线写法与中文字段名。
 */

export type FrontMatter = {
  title?: string
  slug?: string
  date?: string
  categories: string[]
  tags: string[]
  series?: string
  description?: string
  cover?: string
}

export type ParsedMarkdown = {
  data: FrontMatter
  /** front matter 之后的正文 */
  content: string
  /** 从文件名推断出的标题（去扩展名，连字符转空格） */
  filenameTitle: string
}

const stripQuotes = (value: string) => value.trim().replace(/^['"]|['"]$/g, '')

const normalizeKey = (key: string) => key.toLowerCase().replace(/[-_\s]/g, '')

const KEY_ALIASES: Record<string, keyof FrontMatter> = {
  title: 'title',
  slug: 'slug',
  date: 'date',
  category: 'categories',
  categories: 'categories',
  tag: 'tags',
  tags: 'tags',
  series: 'series',
  description: 'description',
  summary: 'description',
  excerpt: 'description',
  cover: 'cover',
  coverimage: 'cover',
  image: 'cover',
  标题: 'title',
  路径: 'slug',
  日期: 'date',
  分类: 'categories',
  标签: 'tags',
  系列: 'series',
  摘要: 'description',
  封面: 'cover',
}

const parseList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => stripQuotes(item))
    .filter(Boolean)

export const parseMarkdown = (raw: string, filename: string): ParsedMarkdown => {
  const normalized = raw.replace(/\r\n/g, '\n')
  const filenameTitle = filename.replace(/\.(md|markdown)$/i, '').replace(/[-_]/g, ' ').trim()
  const data: FrontMatter = { categories: [], tags: [] }

  if (!normalized.startsWith('---')) {
    return { content: normalized.trim(), data, filenameTitle }
  }

  const lines = normalized.split('\n')
  let endIndex = -1

  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === '---') {
      endIndex = index
      break
    }
  }

  if (endIndex === -1) {
    return { content: normalized.trim(), data, filenameTitle }
  }

  let listTarget: 'categories' | 'tags' | null = null

  lines.slice(1, endIndex).forEach((line) => {
    const listItem = /^\s*-\s+(.*)$/.exec(line)

    if (listItem && listTarget) {
      const value = stripQuotes(listItem[1])
      if (value) data[listTarget].push(value)
      return
    }

    const entry = /^([A-Za-z_\u4e00-\u9fa5][\w\u4e00-\u9fa5-]*):\s*(.*)$/.exec(line)

    if (!entry) return

    const key = KEY_ALIASES[normalizeKey(entry[1])]
    const value = stripQuotes(entry[2])

    if (!key) return

    if (key === 'categories' || key === 'tags') {
      data[key] = value ? parseList(value) : []
      listTarget = value ? null : key
      return
    }

    listTarget = null
    if (value) data[key] = value
  })

  return {
    content: lines.slice(endIndex + 1).join('\n').trim(),
    data,
    filenameTitle,
  }
}

/** 没有 description 时，用正文纯文本开头兜底摘要 */
export const summarize = (markdown: string, max = 100): string =>
  markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$\n]*\$/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

/** front matter 里的日期转成 ISO 字符串，无效时返回 null */
export const parseDate = (value?: string): string | null => {
  if (!value) return null

  const candidate = new Date(value.includes('/') ? value.replace(/\//g, '-') : value)

  return Number.isNaN(candidate.getTime()) ? null : candidate.toISOString()
}
