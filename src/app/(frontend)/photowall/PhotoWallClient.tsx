'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Images } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import { cn } from '@/utilities/ui'

import { AlbumLightbox } from './AlbumLightbox'
import type { AlbumData } from './types'
import { pad2 } from './utils'

type Props = {
  albums: AlbumData[]
}

type ViewMode = 'albums' | 'photos'

type LightboxState = {
  index: number
  /** 打开时的缩略图位置，用于展开动画；切换图片后置空 */
  rect: DOMRect | null
}

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
    <div className="relative mx-auto w-full pt-2 pb-12">
      {backLayers.map((layer, layerIndex) => {
        const photo = photos[2 - layerIndex]

        return (
          <div
            className={cn(
              'absolute left-1/2 aspect-[16/10] w-[86%] -translate-x-1/2 rounded-[18px] border p-2 shadow-[0_26px_45px_-34px_rgba(15,23,42,0.6)] transition-transform duration-500 ease-out motion-reduce:transition-none',
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
                  sizes="(max-width: 640px) 80vw, 420px"
                  src={photo.thumbSrc}
                />
              </div>
            ) : null}
          </div>
        )
      })}

      <div className="relative z-20 mx-auto aspect-[16/10] w-[86%] -rotate-[4deg] rounded-[18px] border border-white/80 bg-white/90 p-2 shadow-[0_30px_52px_-32px_rgba(15,23,42,0.65)] transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:-translate-y-1 group-hover:-rotate-[1.5deg]">
        {front ? (
          <div className="relative h-full w-full overflow-hidden rounded-[11px]">
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="(max-width: 640px) 80vw, 420px"
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
  <article className="group relative w-full max-w-[480px] shrink-0 md:w-[calc(50%_-_1rem)] lg:w-[480px] lg:max-w-[calc(50%_-_1rem)] xl:max-w-[calc(33.333%_-_1.333rem)]">
    <h2 className="mb-2 text-center text-[21px] leading-tight font-semibold tracking-[-0.03em] text-slate-800 [text-shadow:0_1px_0_rgba(255,255,255,.35)] sm:text-[24px] dark:text-slate-50 dark:[text-shadow:0_1px_8px_rgba(0,0,0,.35)]">
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
  <div className="mx-auto w-full max-w-[1600px] px-4 pt-5 pb-6 sm:px-6 lg:px-8">
    <h1 className="mb-4 text-center text-[38px] leading-none font-bold tracking-[-0.05em] text-slate-800 [text-shadow:0_1px_0_rgba(255,255,255,.35)] sm:text-[44px] dark:text-slate-50 dark:[text-shadow:0_1px_10px_rgba(0,0,0,.4)]">
      相册
    </h1>

    {albums.length > 0 ? (
      <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-8">
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

const PhotoGrid: React.FC<{
  album: AlbumData
  onOpen: (index: number, rect: DOMRect) => void
}> = ({ album, onOpen }) => {
  if (album.photos.length === 0) {
    return (
      <div className="mx-auto mt-4 w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-white/40 bg-white/20 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/40">
          <div className="text-center text-slate-600 dark:text-slate-300">
            <Images className="mx-auto mb-3 h-8 w-8 opacity-50" />
            <p className="text-[14px]">这个相册还没有照片。</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-4 w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="columns-1 gap-5 sm:columns-2 sm:gap-6 xl:columns-3">
        {album.photos.map((photo, index) => {
          return (
            <button
              aria-label={`查看第 ${index + 1} 张${photo.caption ? `：${photo.caption}` : ''}`}
              className="group relative mb-5 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-[16px] border border-white/35 bg-white/10 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.8)] outline-none focus-visible:ring-2 focus-visible:ring-sky-300/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:mb-6"
              key={photo.id}
              onClick={(event) => onOpen(index, event.currentTarget.getBoundingClientRect())}
              style={{ aspectRatio: `${photo.width || 16} / ${photo.height || 9}` }}
              type="button"
            >
              <Image
                alt={photo.caption || `${album.title} 第 ${index + 1} 张`}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                src={photo.src}
                style={{ objectFit: 'cover' }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

const AlbumDetail: React.FC<{
  album: AlbumData
  onBack: () => void
  onOpen: (index: number, rect: DOMRect) => void
}> = ({ album, onBack, onOpen }) => (
  <div className="w-full">
    <div className="mx-auto w-full max-w-[1600px] px-4 pt-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/45 bg-white/25 px-3 py-2.5 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.5)] backdrop-blur-2xl sm:px-4 sm:py-3 dark:border-white/10 dark:bg-slate-950/40">
        <button
          aria-label="返回相册列表"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/25 text-slate-700 transition-colors hover:bg-white/45 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="font-mono text-[12px] tracking-wide text-slate-500 dark:text-slate-400">
            相册
          </div>
          <h1 className="truncate text-[24px] leading-tight font-semibold tracking-[-0.035em] text-slate-800 sm:text-[28px] dark:text-slate-50">
            {album.title}
          </h1>
        </div>

        <span className="ml-auto shrink-0 font-mono text-[13px] text-slate-500 tabular-nums dark:text-slate-400">
          {pad2(album.photos.length)} 张
        </span>
      </div>
    </div>

    <PhotoGrid album={album} onOpen={onOpen} />
  </div>
)

export const PhotoWallClient: React.FC<Props> = ({ albums }) => {
  const reducedMotion = useReducedMotion() ?? false
  const [view, setView] = useState<ViewMode>('albums')
  const [activeAlbumID, setActiveAlbumID] = useState<number | null>(albums[0]?.id ?? null)
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)

  const activeAlbum = albums.find((album) => album.id === activeAlbumID) ?? albums[0] ?? null

  const openAlbum = (id: number) => {
    setActiveAlbumID(id)
    setView('photos')
    setLightbox(null)
  }

  const backToAlbums = () => {
    setView('albums')
    setLightbox(null)
  }

  const openPhoto = (index: number, rect: DOMRect) => {
    setLightbox({ index, rect })
  }

  const changePhoto = (index: number) => {
    setLightbox((current) => (current ? { index, rect: null } : current))
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
            <AlbumDetail album={activeAlbum} onBack={backToAlbums} onOpen={openPhoto} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeAlbum && lightbox ? (
          <AlbumLightbox
            album={activeAlbum}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
            onIndexChange={changePhoto}
            sourceRect={lightbox.rect}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
