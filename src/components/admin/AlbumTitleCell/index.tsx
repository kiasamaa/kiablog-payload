'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import './index.scss'

type MediaDoc = {
  sizes?: null | Record<string, { url?: null | string } | undefined>
  url?: null | string
}

type Props = {
  linkURL?: string
  rowData?: Record<string, unknown>
}

/** 同一相册的"第一张照片"只查一次，避免列表滚动时重复请求 */
const firstPhotoCache = new Map<string, null | string>()

const firstPhotoThumb = async (albumId: string): Promise<null | string> => {
  if (firstPhotoCache.has(albumId)) return firstPhotoCache.get(albumId) ?? null

  try {
    const response = await fetch(
      `/api/photos?where[album][equals]=${albumId}&limit=1&depth=1&sort=sort`,
      { credentials: 'include' },
    )

    if (!response.ok) {
      firstPhotoCache.set(albumId, null)
      return null
    }

    const json = (await response.json()) as {
      docs?: { image?: MediaDoc | number | null }[]
    }
    const image = json.docs?.[0]?.image
    const url =
      image && typeof image === 'object'
        ? (image.sizes?.thumbnail?.url || image.url || null)
        : null

    firstPhotoCache.set(albumId, url)
    return url
  } catch {
    return null
  }
}

/**
 * 相册列表的"相册名"列：像媒体库的 filename 列那样，缩略图 + 名称放在同一格里。
 * 缩略图优先用相册封面，没设置时回退到该相册第一张照片。
 */
export const AlbumTitleCell: React.FC<Props> = ({ linkURL, rowData }) => {
  const { config } = useConfig()
  const adminRoute = config?.routes?.admin || '/admin'

  const rawId = rowData?.id
  const albumId =
    typeof rawId === 'number' || typeof rawId === 'string' ? String(rawId) : null
  const title = typeof rowData?.title === 'string' && rowData.title ? rowData.title : '未命名相册'

  const cover = rowData?.cover
  const coverMedia = cover && typeof cover === 'object' ? (cover as MediaDoc) : null
  const coverUrl = coverMedia?.sizes?.thumbnail?.url || coverMedia?.url || null

  const [fallbackUrl, setFallbackUrl] = useState<null | string>(null)

  useEffect(() => {
    if (coverUrl || !albumId) return

    let alive = true
    void firstPhotoThumb(albumId).then((url) => {
      if (alive && url) setFallbackUrl(url)
    })

    return () => {
      alive = false
    }
  }, [albumId, coverUrl])

  const url = coverUrl || fallbackUrl
  const href = linkURL || (albumId ? `${adminRoute}/collections/albums/${albumId}` : null)

  const content = (
    <>
      <span className="album-title-cell__thumb">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="album-title-cell__img" src={url} />
        ) : (
          <span className="album-title-cell__img album-title-cell__img--empty" />
        )}
      </span>
      <span className="album-title-cell__name">{title}</span>
    </>
  )

  return href ? (
    <a className="album-title-cell" href={href}>
      {content}
    </a>
  ) : (
    <span className="album-title-cell">{content}</span>
  )
}

export default AlbumTitleCell
