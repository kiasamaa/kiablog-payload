import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

import type { Album } from '../../../payload-types'

const PHOTO_WALL_PATH = '/photowall'

export const revalidateAlbum: CollectionAfterChangeHook<Album> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(PHOTO_WALL_PATH)
    revalidateTag('albums', 'max')
  }

  return doc
}

export const revalidateAlbumDelete: CollectionAfterDeleteHook<Album> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath(PHOTO_WALL_PATH)
    revalidateTag('albums', 'max')
  }

  return doc
}
