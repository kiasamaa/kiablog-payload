import configPromise from '@payload-config'
import { ArrowRight, Camera } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { PostCard } from '@/components/posts/PostCard'
import { SiteProfile } from '@/components/site/SiteProfile'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { toPostCardData } from '@/utilities/toPostCardData'

export const metadata: Metadata = {
  title: '首页',
}

export const revalidate = 600

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [settings, posts, albums] = await Promise.all([
    getCachedGlobal('site-settings', 1)(),
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'albums',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      pagination: false,
      sort: 'sort',
    }),
  ])

  return (
    <>
      <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-5xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <SiteProfile
          actions={
            <>
              <Link
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-500 to-sky-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
                href="/posts"
              >
                浏览文章
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                className="glass-button inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                href="/photowall"
              >
                <Camera className="h-4 w-4" />
                看看壁纸
              </Link>
            </>
          }
          settings={settings}
          variant="hero"
        />
      </section>

      {posts.docs.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-800 md:text-2xl dark:text-slate-50">
                最新文章
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                最近写下的技术与生活记录
              </p>
            </div>

            <Link
              className="flex items-center gap-1 text-xs text-indigo-600 transition-colors hover:text-indigo-500 dark:text-sky-300"
              href="/posts"
            >
              查看全部
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.docs.map((post, index) => (
              <PostCard index={index} key={post.id} post={toPostCardData(post)} />
            ))}
          </div>
        </section>
      ) : null}

      {albums.docs.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-800 md:text-2xl dark:text-slate-50">
                壁纸墙
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                收集光影里的日常
              </p>
            </div>

            <Link
              className="flex items-center gap-1 text-xs text-indigo-600 transition-colors hover:text-indigo-500 dark:text-sky-300"
              href="/photowall"
            >
              查看全部
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {albums.docs.map((album) => {
              const cover = album.cover && typeof album.cover === 'object' ? album.cover : null
              const coverUrl = cover ? getMediaUrl(cover.sizes?.medium?.url || cover.url) : null

              return (
                <Link
                  className="group relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-800 shadow-lg shadow-slate-900/5 transition-shadow hover:shadow-2xl hover:shadow-indigo-500/15"
                  href="/photowall"
                  key={album.id}
                >
                  {coverUrl ? (
                    <Image
                      alt={album.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      src={coverUrl}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 via-sky-400/30 to-cyan-400/50" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-base font-semibold text-white">{album.title}</p>
                    {album.description ? (
                      <p className="mt-1 line-clamp-1 text-xs text-white/65">{album.description}</p>
                    ) : null}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </>
  )
}
