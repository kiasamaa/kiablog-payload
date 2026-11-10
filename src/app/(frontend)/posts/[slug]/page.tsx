import configPromise from '@payload-config'
import { ArrowLeft, Calendar, Clock, Eye, FolderOpen } from 'lucide-react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { MarkdownContent } from '@/components/posts/MarkdownContent'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ReadingProgress } from '@/components/ui/ReadingProgress'
import type { Post } from '@/payload-types'
import { formatDate } from '@/utilities/formatDate'
import { generateMeta } from '@/utilities/generateMeta'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { renderMarkdown } from '@/utilities/markdown'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return posts.docs.map(({ slug }) => ({ slug }))
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = `/posts/${decodedSlug}`

  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) {
    return <PayloadRedirects url={url} />
  }

  const cover = post.cover && typeof post.cover === 'object' ? post.cover : null
  const coverUrl = cover ? getMediaUrl(cover.sizes?.xlarge?.url || cover.url) : null
  const category = post.category && typeof post.category === 'object' ? post.category : null
  const tags = post.tags?.map((tag) => tag.tag).filter(Boolean) ?? []
  const html = renderMarkdown(post.markdown)
  const related = await queryRelatedPosts(post)

  return (
    <article className="pb-20">
      <ReadingProgress />
      {draft ? <LivePreviewListener /> : null}

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-indigo-500 dark:text-slate-400 dark:hover:text-sky-300"
          href="/posts"
        >
          <ArrowLeft className="h-4 w-4" />
          返回文章列表
        </Link>

        <header className="mt-6">
          <h1 className="max-w-4xl font-serif text-3xl leading-tight font-bold text-slate-800 md:text-4xl dark:text-slate-50">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="glass-button flex items-center gap-1.5 px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt)}
            </span>

            {category ? (
              <span className="glass-button flex items-center gap-1.5 px-3 py-1.5">
                <FolderOpen className="h-3.5 w-3.5" />
                {category.title}
              </span>
            ) : null}

            <span className="glass-button flex items-center gap-1.5 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime || 1} 分钟阅读
            </span>

            <span className="glass-button flex items-center gap-1.5 px-3 py-1.5">
              <Eye className="h-3.5 w-3.5" />
              {post.views ?? 0} 次浏览
            </span>

            {tags.map((tag) => (
              <span
                className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-indigo-600 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300"
                key={tag}
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {coverUrl ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl shadow-xl shadow-slate-900/10">
            <Image
              alt={post.title}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1152px"
              src={coverUrl}
            />
          </div>
        ) : null}

        <div className="mx-auto mt-10 max-w-[48rem]">
          <MarkdownContent html={html} />
        </div>

        {related.length > 0 ? (
          <section className="mx-auto mt-16 max-w-[48rem]">
            <h2 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
              相关文章
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {related.map((item) => {
                const itemCover =
                  item.cover && typeof item.cover === 'object'
                    ? getMediaUrl(item.cover.sizes?.small?.url || item.cover.url)
                    : null

                return (
                  <Link
                    className="glass-card group block overflow-hidden rounded-2xl transition-transform hover:-translate-y-0.5"
                    href={`/posts/${item.slug}`}
                    key={item.id}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
                      {itemCover ? (
                        <Image
                          alt={item.title}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          fill
                          sizes="(max-width: 640px) 100vw, 240px"
                          src={itemCover}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/50 to-sky-400/40" />
                      )}
                    </div>

                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDate(item.publishedAt)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

const queryRelatedPosts = async (post: Post): Promise<Post[]> => {
  const categoryID = post.category && typeof post.category === 'object' ? post.category.id : undefined

  if (!categoryID) return []

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 3,
    overrideAccess: false,
    pagination: false,
    sort: '-publishedAt',
    where: {
      and: [
        {
          category: {
            equals: categoryID,
          },
        },
        {
          id: {
            not_equals: post.id,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return result.docs
}
