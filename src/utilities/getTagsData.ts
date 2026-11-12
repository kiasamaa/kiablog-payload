import configPromise from '@payload-config'
import { getPayload } from 'payload'

export type TagGroup = {
  name: string
  count: number
  posts: { title: string; slug: string }[]
}

/** 聚合所有标签，并带上每个标签下最近的几篇文章 */
export const getTagsWithPosts = async (postsPerTag = 3): Promise<TagGroup[]> => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: '-publishedAt',
    select: {
      slug: true,
      tags: true,
      title: true,
    },
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const map = new Map<string, TagGroup>()

  result.docs.forEach((post) => {
    const tags = (post.tags ?? []) as { tag?: string | null }[]

    tags.forEach((item) => {
      const name = item?.tag

      if (!name) return

      const group = map.get(name) ?? { count: 0, name, posts: [] }

      group.count += 1

      if (group.posts.length < postsPerTag) {
        group.posts.push({ slug: post.slug, title: post.title })
      }

      map.set(name, group)
    })
  })

  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )
}
