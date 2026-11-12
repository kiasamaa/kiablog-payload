import 'dotenv/config'

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { getPayload, type Payload, type RequiredDataFromCollectionSlug } from 'payload'

import config from '../src/payload.config'

const HEXO_POSTS_DIR =
  process.env.HEXO_POSTS_DIR || path.resolve(process.cwd(), '../hexo/source/_posts')

/** 文件名（不含 .md）→ 英文语义 slug */
const SLUG_MAP: Record<string, string> = {
  'Butterfly自定义右键菜单': 'butterfly-custom-context-menu',
  'Hexo本地搭建': 'hexo-local-setup',
  'Hexo部署': 'hexo-deploy',
  'Hexo顶部导航栏魔改': 'hexo-navbar-customization',
  'Latex数学公式符号大全': 'latex-symbols-cheatsheet',
  'Markdown快速入门——笔记、分享、教程': 'markdown-quickstart',
  'Mermaid图表工具': 'mermaid-guide',
  'Pug快速入门': 'pug-quickstart',
  'React学习笔记': 'react-notes',
  '个人博客搭建记录': 'blog-build-log',
  前期工作: 'preparation-work',
  '域名、备案、图床、https': 'domain-icp-image-hosting-https',
  如何在网页中实现无限画布效果: 'infinite-canvas-web',
}

/** 原文没有 description 时的兜底摘要（内容以表格为主时自动截取效果很差） */
const DESCRIPTION_OVERRIDES: Record<string, string> = {
  'latex-symbols-cheatsheet': 'LaTeX 常用数学符号速查表：希腊字母、运算符、关系符与箭头等。',
}

/** Hexo 侧固定的受控分类词表 */
const CATEGORY_SEEDS = [
  { slug: 'experience', title: '经验分享', sort: 1 },
  { slug: 'recommendation', title: '好物推荐', sort: 2 },
  { slug: 'entertainment', title: '影音娱乐', sort: 3 },
  { slug: 'repost', title: '转载内容', sort: 4 },
]

/** 种子脚本生成的演示文章，导入真实内容时清掉 */
const LEGACY_SLUGS = ['getting-started', 'markdown-guide', 'a-quiet-weekend']

type FrontMatter = {
  title?: string
  date?: string
  cover?: string
  description?: string
  categories?: string
  series?: string
  tags: string[]
}

const stripQuotes = (value: string) => value.trim().replace(/^['"]|['"]$/g, '')

const parseFrontMatter = (raw: string): { data: FrontMatter; content: string } => {
  const normalized = raw.replace(/\r\n/g, '\n')

  if (!normalized.startsWith('---')) {
    return { content: normalized.trim(), data: { tags: [] } }
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
    return { content: normalized.trim(), data: { tags: [] } }
  }

  const data: FrontMatter = { tags: [] }
  let listTarget: string[] | null = null

  lines.slice(1, endIndex).forEach((line) => {
    const listItem = /^\s*-\s+(.*)$/.exec(line)

    if (listItem && listTarget) {
      listTarget.push(stripQuotes(listItem[1]))
      return
    }

    const entry = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line)

    if (!entry) return

    const key = entry[1]
    const value = stripQuotes(entry[2])

    if (key === 'tags') {
      if (value) {
        data.tags = value
          .split(',')
          .map((tag) => stripQuotes(tag))
          .filter(Boolean)
      } else {
        listTarget = data.tags
      }
      return
    }

    listTarget = null

    if (!value) return

    if (key === 'title') data.title = value
    if (key === 'date') data.date = value
    if (key === 'cover') data.cover = value
    if (key === 'description') data.description = value
    if (key === 'categories') data.categories = value
    if (key === 'series') data.series = value
  })

  return {
    content: lines.slice(endIndex + 1).join('\n').trim(),
    data,
  }
}

const toISOString = (value?: string): string => {
  if (!value) return new Date().toISOString()

  const date = new Date(value.includes('/') ? value.replace(/\//g, '-') : value)

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

/** 没有 description 的文章，用正文纯文本开头作为摘要 */
const summarize = (markdown: string): string =>
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
    .slice(0, 100)

const upsertCategory = async (payload: Payload, seed: (typeof CATEGORY_SEEDS)[number]) => {
  const existing = await payload.find({
    collection: 'categories',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: seed.slug } },
  })

  if (existing.docs[0]) return existing.docs[0]

  return payload.create({
    collection: 'categories',
    context: { disableRevalidate: true },
    data: seed,
    overrideAccess: true,
  })
}

const run = async () => {
  const payload = await getPayload({ config })

  payload.logger.info(`Reading Hexo posts from ${HEXO_POSTS_DIR}`)

  const categoryIDByTitle = new Map<string, number>()

  for (const seed of CATEGORY_SEEDS) {
    const category = await upsertCategory(payload, seed)

    categoryIDByTitle.set(seed.title, category.id)
  }

  for (const slug of LEGACY_SLUGS) {
    const legacy = await payload.find({
      collection: 'posts',
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { slug: { equals: slug } },
    })

    if (legacy.docs[0]) {
      await payload.delete({
        collection: 'posts',
        context: { disableRevalidate: true },
        id: legacy.docs[0].id,
        overrideAccess: true,
      })
      payload.logger.info(`Removed demo post: ${slug}`)
    }
  }

  const files = readdirSync(HEXO_POSTS_DIR).filter((file) => file.endsWith('.md'))
  let created = 0
  let updated = 0
  const skipped: string[] = []

  for (const file of files) {
    const baseName = path.basename(file, '.md')
    const slug = SLUG_MAP[baseName]

    if (!slug) {
      skipped.push(baseName)
      continue
    }

    const raw = readFileSync(path.join(HEXO_POSTS_DIR, file), 'utf8')
    const { data, content } = parseFrontMatter(raw)

    if (!data.title) {
      skipped.push(baseName)
      continue
    }

    // 原文没有写 categories 的文章，统一归到默认分类
    const categoryID = categoryIDByTitle.get(data.categories || '经验分享')

    const postData: RequiredDataFromCollectionSlug<'posts'> = {
      _status: 'published',
      category: categoryID,
      coverUrl: data.cover,
      description: data.description || DESCRIPTION_OVERRIDES[slug] || summarize(content),
      markdown: content,
      publishedAt: toISOString(data.date),
      series: data.series,
      slug,
      tags: data.tags.map((tag) => ({ tag })),
      title: data.title,
    }

    const existing = await payload.find({
      collection: 'posts',
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { slug: { equals: slug } },
    })

    if (existing.docs[0]) {
      await payload.update({
        collection: 'posts',
        context: { disableRevalidate: true },
        data: postData,
        id: existing.docs[0].id,
        overrideAccess: true,
      })
      updated += 1
    } else {
      await payload.create({
        collection: 'posts',
        context: { disableRevalidate: true },
        data: postData,
        overrideAccess: true,
      })
      created += 1
    }

    payload.logger.info(`Imported: ${baseName} → /posts/${slug}`)
  }

  payload.logger.info(`Done. created=${created}, updated=${updated}, skipped=${skipped.length}`)

  if (skipped.length > 0) {
    payload.logger.warn(`Skipped (no slug mapping): ${skipped.join(', ')}`)
  }

  process.exit(0)
}

void run()
