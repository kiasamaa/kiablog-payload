'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Camera, ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Lightbox } from '@/components/ui/Lightbox'
import { cn } from '@/utilities/ui'

export type AlbumData = {
  id: number
  title: string
  description?: string | null
  coverUrl?: string | null
  photos: {
    id: number
    src: string
    caption?: string | null
    orientation?: string | null
  }[]
}

type Props = {
  albums: AlbumData[]
}

export const PhotoWallClient: React.FC<Props> = ({ albums }) => {
  const [expandedID, setExpandedID] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState<{ albumID: number; index: number } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (expandedID === null || lightbox) return

    const onPointerDown = (event: MouseEvent) => {
      if (gridRef.current && !gridRef.current.contains(event.target as Node)) {
        setExpandedID(null)
      }
    }

    document.addEventListener('mousedown', onPointerDown)

    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [expandedID, lightbox])

  const openLightbox = useCallback((albumID: number, index: number) => {
    setLightbox({ albumID, index })
  }, [])

  const activeAlbum = lightbox ? albums.find((album) => album.id === lightbox.albumID) : null

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12"
        initial={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <Camera className="h-5 w-5 text-sky-500 md:h-7 md:w-7" />
          <h1 className="font-serif text-2xl font-bold text-slate-800 md:text-3xl dark:text-slate-50">
            照片墙
          </h1>
        </div>

        <p className="mt-2 ml-7 text-sm text-slate-500 md:ml-10 md:text-base dark:text-slate-400">
          收集光影里的日常，点击相册展开照片。
        </p>
      </motion.div>

      {albums.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-3xl px-6 py-24 text-slate-500 dark:text-slate-400">
          <ImageIcon className="mb-4 h-12 w-12 opacity-40" />
          <p className="text-sm">相册还是空的</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" ref={gridRef}>
          {albums.map((album, index) => {
            const expanded = expandedID === album.id

            return (
              <motion.article
                animate={{ opacity: expandedID === null || expanded ? 1 : 0.45, y: 0 }}
                className={cn(
                  'glass-card overflow-hidden rounded-3xl transition-shadow',
                  expanded ? 'sm:col-span-2 lg:col-span-3' : 'hover:shadow-xl hover:shadow-indigo-500/10',
                )}
                initial={{ opacity: 0, y: 24 }}
                key={album.id}
                transition={{ delay: Math.min(index, 6) * 0.06, duration: 0.4, ease: 'easeOut' }}
              >
                <button
                  className="group relative block w-full text-left"
                  onClick={() => setExpandedID(expanded ? null : album.id)}
                  type="button"
                >
                  <div
                    className={cn(
                      'relative w-full overflow-hidden bg-slate-800',
                      expanded ? 'h-36 sm:h-44' : 'aspect-[3/2]',
                    )}
                  >
                    {album.coverUrl ? (
                      <Image
                        alt={album.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        src={album.coverUrl}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 via-sky-400/30 to-cyan-400/50" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                      <div>
                        <h2 className="text-base font-semibold text-white md:text-lg">
                          {album.title}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-white/65">
                          {album.photos.length} 张照片
                        </p>
                      </div>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
                        {expanded ? <X className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                      </span>
                    </div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden"
                      exit={{ height: 0, opacity: 0 }}
                      initial={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <div className="p-4">
                        {album.description ? (
                          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                            {album.description}
                          </p>
                        ) : null}

                        {album.photos.length === 0 ? (
                          <p className="py-8 text-center text-xs text-slate-400">
                            这个相册还没有照片
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                            {album.photos.map((photo, photoIndex) => (
                              <button
                                className="group relative aspect-square overflow-hidden rounded-xl bg-slate-800"
                                key={photo.id}
                                onClick={() => openLightbox(album.id, photoIndex)}
                                type="button"
                              >
                                <Image
                                  alt={photo.caption || album.title}
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  fill
                                  sizes="(max-width: 640px) 50vw, 25vw"
                                  src={photo.src}
                                />
                                <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>
      )}

      {lightbox && activeAlbum ? (
        <Lightbox
          images={activeAlbum.photos.map((photo) => ({
            caption: photo.caption,
            src: photo.src,
          }))}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </section>
  )
}
