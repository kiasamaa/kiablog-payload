import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Categories: CollectionConfig = {
  slug: 'categories',
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
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
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
}
