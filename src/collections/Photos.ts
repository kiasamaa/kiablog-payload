import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidatePhoto, revalidatePhotoDelete } from './Photos/hooks/revalidatePhoto'

export const Photos: CollectionConfig = {
  slug: 'photos',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: '照片墙',
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'album', 'orientation', 'sort', 'updatedAt'],
  },
  fields: [
    {
      name: 'album',
      type: 'relationship',
      relationTo: 'albums',
      required: true,
      index: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'orientation',
      type: 'select',
      defaultValue: 'landscape',
      options: [
        { label: '横图', value: 'landscape' },
        { label: '竖图', value: 'portrait' },
        { label: '方图', value: 'square' },
      ],
    },
    {
      name: 'sort',
      type: 'number',
      admin: {
        description: '数字越小越靠前',
        position: 'sidebar',
      },
      defaultValue: 0,
    },
  ],
  hooks: {
    afterChange: [revalidatePhoto],
    afterDelete: [revalidatePhotoDelete],
  },
}
