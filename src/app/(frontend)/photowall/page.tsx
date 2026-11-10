import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { PhotoWallClient, type AlbumData } from './PhotoWallClient'

export const metadata: Metadata = {
  title: '照片墙',
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
    const src = image ? getMediaUrl(image.sizes?.medium?.url || image.url) : ''

    if (!albumID || !src) return

    const list = photosByAlbum.get(albumID) ?? []

    list.push({
      caption: photo.caption,
      id: photo.id,
      orientation: photo.orientation,
      src,
    })
    photosByAlbum.set(albumID, list)
  })

  const albums: AlbumData[] = albumsResult.docs.map((album) => {
    const cover = album.cover && typeof album.cover === 'object' ? album.cover : null

    return {
      coverUrl: cover ? getMediaUrl(cover.sizes?.medium?.url || cover.url) : null,
      description: album.description,
      id: album.id,
      photos: photosByAlbum.get(album.id) ?? [],
      title: album.title,
    }
  })

  return <PhotoWallClient albums={albums} />
}
