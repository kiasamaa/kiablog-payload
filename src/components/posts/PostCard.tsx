'use client'

import { motion } from 'framer-motion'
import { Clock, Eye, Pin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useRef, useState } from 'react'

export type PostCardData = {
  id: number
  title: string
  slug: string
  description?: string | null
  coverUrl?: string | null
  categoryTitle?: string | null
  categorySlug?: string | null
  tags?: string[]
  isPinned?: boolean | null
  views?: number | null
  readingTime?: number | null
  publishedAtLabel?: string
}

type Props = {
  post: PostCardData
  index: number
}

export const PostCard: React.FC<Props> = ({ post, index }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    setTilt({
      rotateX: ((y - centerY) / centerY) * -5,
      rotateY: ((x - centerX) / centerX) * 5,
    })
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.16 })
  }

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 })
    setGlare({ x: 50, y: 50, opacity: 0 })
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 30 }}
      transition={{ delay: Math.min(index, 6) * 0.06, duration: 0.45, ease: 'easeOut' }}
    >
      <Link className="group block" href={`/posts/${post.slug}`}>
        <div
          className="relative overflow-hidden rounded-3xl shadow-lg shadow-slate-900/5 transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/15"
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          ref={cardRef}
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative transition-transform duration-200 ease-out"
            style={{
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
              {post.coverUrl ? (
                <Image
                  alt={post.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  src={post.coverUrl}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/60 via-sky-500/40 to-purple-500/60" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                {post.isPinned ? (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                    <Pin className="h-3 w-3" />
                    置顶
                  </span>
                ) : (
                  <span />
                )}

                {post.categoryTitle ? (
                  <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                    {post.categoryTitle}
                  </span>
                ) : null}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <h3 className="mb-1.5 line-clamp-2 text-base leading-snug font-bold text-white md:text-lg">
                  {post.title}
                </h3>

                {post.description ? (
                  <p className="mb-3 line-clamp-2 text-xs text-white/70 md:text-sm">
                    {post.description}
                  </p>
                ) : null}

                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <div className="flex items-center gap-3">
                    {post.publishedAtLabel ? <span>{post.publishedAtLabel}</span> : null}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingTime || 1} 分钟
                    </span>
                  </div>

                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.views ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
              }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
