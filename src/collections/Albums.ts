import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { chineseSlugField } from '../fields/chineseSlugField'
import { revalidateAlbum, revalidateAlbumDelete } from './Albums/hooks/revalidateAlbum'

export const Albums: CollectionConfig = {
  slug: 'albums',
  labels: {
    singular: '相册',
    plural: '相册',
  },
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
      label: '相册名',
      required: true,
      admin: {
        components: {
          // 缩略图和相册名放同一格，标题列本身负责跳转详情
          Cell: '@/components/admin/AlbumTitleCell',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: '相册描述',
    },
    {
      name: 'cover',
      type: 'upload',
      label: '相册封面',
      relationTo: 'media',
      admin: {
        description: '建议使用 3:2 横图；列表里会和相册名一起显示缩略图',
        // 列表里不再单独占一列
        disableListColumn: true,
      },
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
    chineseSlugField({
      position: undefined,
    }),
    {
      name: 'photosManager',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/AlbumPhotosManager',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateAlbum],
    afterDelete: [revalidateAlbumDelete],
  },
}
