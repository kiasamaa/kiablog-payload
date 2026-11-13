import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidatePhoto, revalidatePhotoDelete } from './Photos/hooks/revalidatePhoto'

export const Photos: CollectionConfig = {
  slug: 'photos',
  labels: {
    singular: '照片',
    plural: '照片',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    // 照片统一在相册详情页里管理，不再单独出现在侧边栏
    hidden: true,
    group: '照片墙',
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'album', 'orientation', 'sort', 'updatedAt'],
  },
  fields: [
    {
      name: 'album',
      type: 'relationship',
      label: '所属相册',
      relationTo: 'albums',
      required: true,
      index: true,
    },
    {
      name: 'image',
      type: 'upload',
      label: '图片',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      label: '照片说明',
    },
    {
      name: 'orientation',
      type: 'select',
      label: '画面方向',
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
      label: '排序',
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
