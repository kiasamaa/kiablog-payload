import type { CollectionBeforeChangeHook } from 'payload'

import type { Post } from '../../../payload-types'

const CJK_REGEX = /[\u4e00-\u9fa5]/g

/**
 * 去掉代码块、链接语法与 Markdown 标记后再统计字数，
 * 中文按字计、西文按词计，阅读速度按 300 字/分钟估算。
 */
const countWords = (markdown: string): number => {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, ' ')
    .replace(/[>*_~|#-]/g, ' ')

  const cjkCount = (plain.match(CJK_REGEX) || []).length
  const latinCount = plain
    .replace(CJK_REGEX, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  return cjkCount + latinCount
}

export const populatePostMeta: CollectionBeforeChangeHook<Post> = ({ data, operation }) => {
  if (typeof data.markdown === 'string' && data.markdown.length > 0) {
    const wordCount = countWords(data.markdown)

    data.wordCount = wordCount
    data.readingTime = Math.max(1, Math.ceil(wordCount / 300))
  }

  if ((operation === 'create' || operation === 'update') && !data.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }

  return data
}
