import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateAlbum, revalidateAlbumDelete } from './Albums/hooks/revalidateAlbum'

export const Albums: CollectionConfig = {
  slug: 'albums',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: '照片墙',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'sort', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: '相册封面，建议使用 3:2 横图',
      },
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
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    afterChange: [revalidateAlbum],
    afterDelete: [revalidateAlbumDelete],
  },
}
