import configPromise from '@payload-config'
import { ArrowLeft, Calendar, Clock, Eye } from 'lucide-react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import { Aside } from '@/components/layout/aside/Aside'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { MarkdownContent } from '@/components/posts/MarkdownContent'
import { SetReadingTitle } from '@/components/posts/SetReadingTitle'
import { ViewTracker } from '@/components/posts/ViewTracker'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import type { Post } from '@/payload-types'
import { formatDate } from '@/utilities/formatDate'
import { generateMeta } from '@/utilities/generateMeta'
import { getRecentPosts, getSeriesPosts } from '@/utilities/getAsideData'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getSiteStats } from '@/utilities/getSiteStats'
import { renderMarkdown } from '@/utilities/markdown'
import { cn } from '@/utilities/ui'

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
  const coverUrl =
    post.coverUrl || (cover ? getMediaUrl(cover.sizes?.xlarge?.url || cover.url) : null)
  const category = post.category && typeof post.category === 'object' ? post.category : null
  const tags = post.tags?.map((tag) => tag.tag).filter(Boolean) ?? []
  const html = renderMarkdown(post.markdown)
  const [related, series, recent, stats, settings] = await Promise.all([
    queryRelatedPosts(post),
    getSeriesPosts(post.series),
    getRecentPosts(4),
    getSiteStats(),
    getCachedGlobal('site-settings', 1)(),
  ])

  return (
    <article className="pb-20">
      <SetReadingTitle title={post.title} />
      <ViewTracker slug={post.slug} />
      {draft ? <LivePreviewListener /> : null}

      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-6 px-4 pt-8 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className="xl:col-span-2">
          <Link
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-indigo-500 dark:text-slate-400 dark:hover:text-sky-300"
            href="/posts"
          >
            <ArrowLeft className="h-4 w-4" />
            返回文章列表
          </Link>
        </div>

        <div className="min-w-0">
          {/* 整篇文章：一张玻璃卡片，封面与正文同处其中 */}
          <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/82 shadow-2xl shadow-blue-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/78">
          {/* 封面与标题叠层 */}
          <div
            className={cn(
              'relative flex flex-col justify-end overflow-hidden',
              coverUrl ? 'h-72 md:h-[22rem]' : 'min-h-[17rem]',
            )}
          >
            {coverUrl ? (
              <Image
                alt={post.title}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 896px"
                src={coverUrl}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-sky-500/70 to-cyan-400" />
            )}

            {/* 暗色遮罩，保证白色标题清晰 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/5" />

            <div className="relative z-10 p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/80">
                {category ? (
                  <Link
                    className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-sm transition-colors hover:bg-white/30"
                    href={`/categories/${category.slug}`}
                  >
                    {category.title}
                  </Link>
                ) : null}

                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              <h1 className="mt-3 font-serif text-[26px] leading-[1.2] font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-[34px]">
                {post.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/75">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readingTime || 1} 分钟阅读
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {post.views ?? 0} 次浏览
                </span>
              </div>

              {tags.length > 0 ? (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {tags.map((tag) => (
                    <span
                      className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] text-white/85 backdrop-blur-sm"
                      key={tag}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* 正文 */}
          <div className="px-5 py-7 md:px-10 md:py-9">
            <MarkdownContent html={html} />
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
              相关文章
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {related.map((item) => {
                const itemCover =
                  item.coverUrl ||
                  (item.cover && typeof item.cover === 'object'
                    ? getMediaUrl(item.cover.sizes?.small?.url || item.cover.url)
                    : null)

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

        <Aside
          currentSlug={post.slug}
          recent={recent}
          series={series}
          settings={settings}
          stats={stats}
          variant="post-detail"
        />
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
