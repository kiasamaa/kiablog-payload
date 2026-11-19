import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { PhotoWallClient } from './PhotoWallClient'
import type { AlbumData } from './types'

export const metadata: Metadata = {
  title: '相册',
}

export const revalidate = 600

export default async function PhotoWallPage() {
  const payload = await getPayload({ config: configPromise })

  const albumsResult = await payload.find({
    collection: 'albums',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'sort',
  })

  const albumIDs = albumsResult.docs.map((album) => album.id)

  const photosResult =
    albumIDs.length > 0
      ? await payload.find({
          collection: 'photos',
          depth: 1,
          limit: 500,
          overrideAccess: false,
          pagination: false,
          sort: 'sort',
          where: {
            album: {
              in: albumIDs,
            },
          },
        })
      : null

  const photosByAlbum = new Map<number, AlbumData['photos']>()

  photosResult?.docs.forEach((photo) => {
    const albumID = typeof photo.album === 'object' ? photo.album.id : photo.album
    const image = typeof photo.image === 'object' ? photo.image : null

    if (!albumID || !image) return

    const detailSize = image.sizes?.xlarge || image.sizes?.large || image.sizes?.medium
    const thumbSize = image.sizes?.medium || image.sizes?.small
    const src = getMediaUrl(detailSize?.url || image.url)
    const thumbSrc = getMediaUrl(thumbSize?.url || image.url)

    if (!src || !thumbSrc) return

    const list = photosByAlbum.get(albumID) ?? []

    list.push({
      author: image.author || null,
      caption: photo.caption,
      height: image.height || detailSize?.height || 0,
      id: photo.id,
      orientation: photo.orientation,
      source: image.source || null,
      src,
      thumbSrc,
      width: image.width || detailSize?.width || 0,
    })
    photosByAlbum.set(albumID, list)
  })

  const albums: AlbumData[] = albumsResult.docs.map((album) => {
    const cover = album.cover && typeof album.cover === 'object' ? album.cover : null
    const photos = photosByAlbum.get(album.id) ?? []

    return {
      coverUrl: cover
        ? getMediaUrl(cover.sizes?.medium?.url || cover.url)
        : (photos[0]?.thumbSrc ?? null),
      description: album.description,
      id: album.id,
      photos,
      title: album.title,
    }
  })

  return <PhotoWallClient albums={albums} />
}
