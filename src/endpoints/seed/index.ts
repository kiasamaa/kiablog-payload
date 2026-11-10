import type { Payload, PayloadRequest } from 'payload'

const categories = [
  { slug: 'tech', title: '技术', description: '开发、工具与工程实践', sort: 1 },
  { slug: 'life', title: '生活', description: '日常记录与随想', sort: 2 },
  { slug: 'reading', title: '阅读', description: '读书笔记与摘录', sort: 3 },
]

const posts = [
  {
    title: '从这里开始',
    slug: 'getting-started',
    description: '介绍这个博客底座的结构与内容维护方式。',
    categorySlug: 'tech',
    tags: [{ tag: '入门' }, { tag: 'Payload' }],
    markdown: `这是一个基于 **Payload CMS + Next.js** 的博客底座。

## 内容维护

- 文章：\`/admin\` → 内容 → 文章，正文使用 Markdown 编写
- 相册：\`/admin\` → 照片墙 → 相册 / 照片
- 站点信息：\`/admin\` → 站点 → 站点设置

## 代码示例

\`\`\`ts
export const hello = (name: string) => \`Hello, \${name}!\`
\`\`\`

> 保持简单，先让站点跑起来，再逐步添加能力。
`,
  },
  {
    title: 'Markdown 写作约定',
    slug: 'markdown-guide',
    description: '标题、列表、代码块与图片在本文中的书写方式。',
    categorySlug: 'tech',
    tags: [{ tag: 'Markdown' }],
    markdown: `## 标题层级

正文建议从 \`##\` 开始，\`#\` 留给文章标题。

## 列表

1. 有序列表
2. 第二项

- 无序列表
- 第二项

## 代码块

\`\`\`bash
pnpm dev
\`\`\`

## 图片

图片可以直接使用 Markdown 语法引用媒体地址，前台支持点击放大。
`,
  },
  {
    title: '一个安静的周末',
    slug: 'a-quiet-weekend',
    description: '关于散步、咖啡和一点点生活节奏的记录。',
    categorySlug: 'life',
    tags: [{ tag: '随笔' }],
    markdown: `清晨的风有一点凉，路边的树影落在地面上，被行人踩得零碎。

午后读了几页书，做了一杯咖啡，把窗子开了一条缝。

**慢下来** 的时候，才注意到很多平时忽略的细节。
`,
  },
]

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  await payload.delete({
    collection: 'photos',
    context: { disableRevalidate: true },
    overrideAccess: true,
    req,
    where: {},
  })

  await payload.delete({
    collection: 'albums',
    context: { disableRevalidate: true },
    overrideAccess: true,
    req,
    where: {},
  })

  await payload.delete({
    collection: 'posts',
    context: { disableRevalidate: true },
    overrideAccess: true,
    req,
    where: {},
  })

  await payload.delete({
    collection: 'categories',
    context: { disableRevalidate: true },
    overrideAccess: true,
    req,
    where: {},
  })

  const categoryDocs = await Promise.all(
    categories.map((category) =>
      payload.create({
        collection: 'categories',
        data: category,
        context: { disableRevalidate: true },
        overrideAccess: true,
        req,
      }),
    ),
  )

  const categoryIDBySlug = new Map(categoryDocs.map((doc) => [doc.slug, doc.id]))

  await Promise.all(
    posts.map((post) =>
      payload.create({
        collection: 'posts',
        data: {
          _status: 'published',
          category: categoryIDBySlug.get(post.categorySlug),
          description: post.description,
          markdown: post.markdown,
          publishedAt: new Date().toISOString(),
          slug: post.slug,
          tags: post.tags,
          title: post.title,
        },
        context: { disableRevalidate: true },
        overrideAccess: true,
        req,
      }),
    ),
  )

  await payload.create({
    collection: 'albums',
    data: {
      description: '旅行与日常的光影片段',
      slug: 'daily',
      sort: 1,
      title: '日常片段',
    },
    context: { disableRevalidate: true },
    overrideAccess: true,
    req,
  })

  payload.logger.info('Seed completed.')
}
