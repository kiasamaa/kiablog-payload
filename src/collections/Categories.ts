import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { chineseSlugField } from '../fields/chineseSlugField'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: '分类',
    plural: '分类',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: '内容',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'sort', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '名称',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
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
  ],
}
