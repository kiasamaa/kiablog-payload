'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  GalleryHorizontalEnd,
  Images,
  LayoutGrid,
} from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

import { AlbumLightbox } from './AlbumLightbox'
import type { AlbumData } from './types'

type Props = {
  albums: AlbumData[]
}

type ViewMode = 'albums' | 'photos'
type PhotoLayout = 'strip' | 'grid'

const pad = (value: number) => String(value).padStart(2, '0')

const backLayers = [
  {
    className: 'top-[9%] z-0 rotate-[8deg]',
    hover: 'group-hover:rotate-[5deg]',
  },
  {
    className: 'top-[4%] z-10 rotate-[3deg]',
    hover: 'group-hover:rotate-[1.5deg]',
  },
]

const AlbumStack: React.FC<{ album: AlbumData }> = ({ album }) => {
  const photos = album.photos.slice(0, 3)
  const front = photos[0]

  return (
    <div className="relative mx-auto w-full pt-2 pb-14 sm:pb-16">
      {backLayers.map((layer, layerIndex) => {
        const photo = photos[2 - layerIndex]

        return (
          <div
            className={cn(
              'absolute left-1/2 aspect-[16/10] w-[82%] -translate-x-1/2 rounded-[18px] border p-2 shadow-[0_26px_45px_-34px_rgba(15,23,42,0.6)] transition-transform duration-500 ease-out',
              layer.className,
              layer.hover,
              photo
                ? 'border-white/80 bg-white/90'
                : 'border-white/35 bg-white/[0.14] backdrop-blur-md',
            )}
            key={`${album.id}-${layerIndex}`}
          >
            {photo ? (
              <div className="relative h-full w-full overflow-hidden rounded-[11px]">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 78vw, (max-width: 1280px) 40vw, 34vw"
                  src={photo.thumbSrc}
                />
              </div>
            ) : null}
          </div>
        )
      })}

      <div className="relative z-20 mx-auto aspect-[16/10] w-[82%] -rotate-[4deg] rounded-[18px] border border-white/80 bg-white/90 p-2 shadow-[0_30px_52px_-32px_rgba(15,23,42,0.65)] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:-rotate-[1.5deg]">
        {front ? (
          <div className="relative h-full w-full overflow-hidden rounded-[11px]">
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="(max-width: 768px) 78vw, (max-width: 1280px) 40vw, 34vw"
              src={front.thumbSrc}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

const AlbumCard: React.FC<{
  album: AlbumData
  onSelect: (id: number) => void
}> = ({ album, onSelect }) => (
  <article className="group relative">
    <h2 className="mb-2 text-center text-[24px] leading-tight font-semibold tracking-[-0.03em] text-slate-800 [text-shadow:0_1px_0_rgba(255,255,255,.35)] sm:text-[28px] dark:text-slate-50 dark:[text-shadow:0_1px_8px_rgba(0,0,0,.35)]">
      {album.title}
    </h2>

    <AlbumStack album={album} />

    <button
      aria-label={`打开相册 ${album.title}`}
      className="absolute inset-0 z-50 cursor-pointer rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
      onClick={() => onSelect(album.id)}
      type="button"
    />
  </article>
)

const AlbumWall: React.FC<{
  albums: AlbumData[]
  onSelect: (id: number) => void
}> = ({ albums, onSelect }) => (
  <div className="mx-auto w-full max-w-[1760px] px-4 pb-6 pt-5 sm:px-6 lg:px-8">
    <h1 className="mb-4 text-center text-[38px] leading-none font-bold tracking-[-0.05em] text-slate-800 [text-shadow:0_1px_0_rgba(255,255,255,.35)] sm:text-[44px] dark:text-slate-50 dark:[text-shadow:0_1px_10px_rgba(0,0,0,.4)]">
      相册
    </h1>

    {albums.length > 0 ? (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        {albums.map((album) => (
          <AlbumCard album={album} key={album.id} onSelect={onSelect} />
        ))}
      </div>
    ) : (
      <div className="flex min-h-[45vh] items-center justify-center rounded-3xl border border-white/40 bg-white/20 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/40">
        <div className="text-center text-slate-600 dark:text-slate-300">
          <Images className="mx-auto mb-3 h-8 w-8 opacity-50" />
          <p className="text-[14px]">还没有相册。</p>
        </div>
      </div>
    )}
  </div>
)

const PhotoCarousel: React.FC<{
  album: AlbumData
  onOpen: (index: number) => void
}> = ({ album, onOpen }) => {
  const reducedMotion = useReducedMotion() ?? false
  const [active, setActive] = useState(0)
  const [stageSize, setStageSize] = useState({ height: 0, width: 0 })
  const stageRef = useRef<HTMLDivElement>(null)
  const total = album.photos.length
  const activePhoto = album.photos[active]
  const half = Math.floor(total / 2)

  useEffect(() => {
    const stage = stageRef.current

    if (!stage) return

    const updateSize = () => {
      setStageSize({ height: stage.clientHeight, width: stage.clientWidth })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const go = (direction: number) => {
    setActive((current) => (current + direction + total) % total)
  }

  const spring = reducedMotion
    ? ({ duration: 0.01 } as const)
    : ({ type: 'spring' as const, stiffness: 240, damping: 30, mass: 0.9 } as const)

  const transition = {
    opacity: { duration: reducedMotion ? 0.01 : 0.24, ease: 'easeOut' as const },
    scale: spring,
    x: spring,
    y: spring,
  }

  if (!activePhoto) return null

  return (
    <div className="mt-3">
      <div
        aria-label="照片轮播"
        className="relative mx-auto w-full max-w-[1600px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            go(-1)
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            go(1)
          }
        }}
        ref={stageRef}
        role="region"
        style={
          {
            height: 'clamp(300px, min(80vh, 56vw), 700px)',
          } as React.CSSProperties
        }
      >
        {album.photos.map((photo, index) => {
          const rawOffset = index - active
          const offset = ((rawOffset + half + total) % total) - half
          const distance = Math.abs(offset)
          const isActive = offset === 0
          const visible = distance <= 1
          const sign = Math.sign(offset)
          const ratio = photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 16 / 9
          const activeWidth = Math.min(stageSize.height * ratio, stageSize.width * 0.8)
          const sideWidth = activeWidth * 0.5
          const sideShift = sign * (stageSize.width / 2 - stageSize.width * 0.06 - sideWidth / 2)

          return (
            <div
              className="absolute inset-0 flex items-center justify-center"
              key={photo.id}
              style={{
                pointerEvents: 'none',
                zIndex: visible ? 30 - distance : 0,
              }}
            >
              <motion.div
                animate={{
                  opacity: isActive ? 1 : stageSize.width > 0 ? 0.58 : 0,
                  scale: isActive ? 1 : 0.5,
                  x: isActive ? 0 : sideShift,
                  y: isActive ? 0 : 24,
                }}
                className="flex h-full w-full items-center justify-center"
                initial={false}
                style={{ willChange: 'transform, opacity' }}
                transition={transition}
              >
                <button
                  aria-current={isActive ? 'true' : undefined}
                  aria-hidden={visible ? undefined : true}
                  aria-label={isActive ? `查看第 ${index + 1} 张` : `切换到第 ${index + 1} 张`}
                  className="relative block max-w-[84vw] cursor-pointer overflow-hidden rounded-[10px] shadow-[0_34px_80px_-38px_rgba(15,23,42,0.9)] outline-none focus-visible:ring-2 focus-visible:ring-sky-300/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  onClick={() => {
                    if (isActive) {
                      onOpen(index)
                    } else {
                      setActive(index)
                    }
                  }}
                  style={{ pointerEvents: visible ? 'auto' : 'none' }}
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                >
                  <Image
                    alt={photo.caption || `${album.title} 第 ${index + 1} 张`}
                    className="h-auto w-auto object-contain"
                    height={photo.height || 1080}
                    priority={distance <= 1}
                    sizes="(max-width: 768px) 80vw, 70vw"
                    src={photo.src}
                    style={{
                      maxHeight: stageSize.height || undefined,
                      maxWidth: stageSize.width ? stageSize.width * 0.8 : undefined,
                    }}
                    width={photo.width || 1920}
                  />
                  <motion.span
                    animate={{ opacity: isActive ? 0 : 0.2 }}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[#05090f]"
                    transition={{ duration: reducedMotion ? 0.01 : 0.24, ease: 'easeOut' }}
                  />
                </button>
              </motion.div>
            </div>
          )
        })}

        <button
          aria-label="上一张照片"
          className="absolute top-1/2 left-3 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/20 text-slate-700 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/35 disabled:pointer-events-none disabled:opacity-25 sm:left-6 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-950/60"
          disabled={total < 2}
          onClick={() => go(-1)}
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          aria-label="下一张照片"
          className="absolute top-1/2 right-3 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/20 text-slate-700 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/35 disabled:pointer-events-none disabled:opacity-25 sm:right-6 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-950/60"
          disabled={total < 2}
          onClick={() => go(1)}
          type="button"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        aria-live="polite"
        className="mt-2 flex min-h-5 items-center justify-center font-mono text-[13px] text-slate-500 dark:text-slate-400"
      >
        {pad(active + 1)} / {pad(total)}
      </div>
    </div>
  )
}

const PhotoGrid: React.FC<{
  album: AlbumData
  onOpen: (index: number) => void
}> = ({ album, onOpen }) => (
  <div className="mx-auto mt-4 w-full max-w-[1800px] px-4 sm:px-5">
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {album.photos.map((photo, index) => {
        const ratio = photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 16 / 9

        return (
          <button
            aria-label={`查看第 ${index + 1} 张`}
            className="group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-[18px] border border-white/35 bg-white/10 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.8)] outline-none focus-visible:ring-2 focus-visible:ring-sky-300/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            key={photo.id}
            onClick={() => onOpen(index)}
            style={{ aspectRatio: `${photo.width || 16} / ${photo.height || 9}` }}
            type="button"
          >
            <Image
              alt={photo.caption || `${album.title} 第 ${index + 1} 张`}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={photo.src}
            />
          </button>
        )
      })}
    </div>
  </div>
)

const AlbumDetail: React.FC<{
  album: AlbumData
  onBack: () => void
  onOpen: (index: number) => void
}> = ({ album, onBack, onOpen }) => {
  const [layout, setLayout] = useState<PhotoLayout>('strip')

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1760px] px-4 pt-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/45 bg-white/25 px-4 py-3 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/40">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="返回相册"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/25 text-slate-700 transition-colors hover:bg-white/45 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
              onClick={onBack}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <div className="font-mono text-[13px] tracking-wide text-slate-500 dark:text-slate-400">
                相册
              </div>
              <h1 className="truncate text-[28px] leading-tight font-semibold tracking-[-0.035em] text-slate-800 sm:text-[32px] dark:text-slate-50">
                {album.title}
              </h1>
            </div>

            <span className="ml-1 shrink-0 font-mono text-[14px] text-slate-500 dark:text-slate-400">
              {pad(album.photos.length)} 张
            </span>
          </div>

          <div
            aria-label="浏览方式"
            className="flex shrink-0 items-center gap-1 rounded-xl border border-white/40 bg-white/20 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/30"
            role="group"
          >
            <button
              aria-label="横卷浏览"
              aria-pressed={layout === 'strip'}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg px-2.5 text-[13px] transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none',
                layout === 'strip'
                  ? 'bg-white/75 text-slate-900 shadow-sm dark:bg-white/15 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
              )}
              onClick={() => setLayout('strip')}
              type="button"
            >
              <GalleryHorizontalEnd className="h-4 w-4" />
              <span className="hidden sm:inline">横卷</span>
            </button>
            <button
              aria-label="列表浏览"
              aria-pressed={layout === 'grid'}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg px-2.5 text-[13px] transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none',
                layout === 'grid'
                  ? 'bg-white/75 text-slate-900 shadow-sm dark:bg-white/15 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
              )}
              onClick={() => setLayout('grid')}
              type="button"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">列表</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          initial={{ opacity: 0, y: 6 }}
          key={layout}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {layout === 'strip' ? (
            <PhotoCarousel album={album} onOpen={onOpen} />
          ) : (
            <PhotoGrid album={album} onOpen={onOpen} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export const PhotoWallClient: React.FC<Props> = ({ albums }) => {
  const reducedMotion = useReducedMotion() ?? false
  const [view, setView] = useState<ViewMode>('albums')
  const [activeAlbumID, setActiveAlbumID] = useState<number | null>(albums[0]?.id ?? null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const activeAlbum = albums.find((album) => album.id === activeAlbumID) ?? albums[0] ?? null

  const openAlbum = (id: number) => {
    setActiveAlbumID(id)
    setView('photos')
    setLightboxIndex(null)
  }

  const backToAlbums = () => {
    setView('albums')
    setLightboxIndex(null)
  }

  return (
    <div className="relative min-h-[calc(100dvh-3.5rem)] overflow-x-hidden">
      <AnimatePresence initial={false} mode="wait">
        {view === 'albums' || !activeAlbum ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            key="albums"
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <AlbumWall albums={albums} onSelect={openAlbum} />
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            key={`album-${activeAlbum.id}`}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <AlbumDetail album={activeAlbum} onBack={backToAlbums} onOpen={setLightboxIndex} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeAlbum && lightboxIndex !== null ? (
          <AlbumLightbox
            album={activeAlbum}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onIndexChange={setLightboxIndex}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
