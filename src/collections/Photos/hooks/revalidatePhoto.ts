import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

import type { Photo } from '../../../payload-types'

const PHOTO_WALL_PATH = '/photowall'

export const revalidatePhoto: CollectionAfterChangeHook<Photo> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(PHOTO_WALL_PATH)
    revalidateTag('albums', 'max')
  }

  return doc
}

export const revalidatePhotoDelete: CollectionAfterDeleteHook<Photo> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath(PHOTO_WALL_PATH)
    revalidateTag('albums', 'max')
  }

  return doc
}
