import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { chineseSlugField } from '../../fields/chineseSlugField'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populatePostMeta } from './hooks/populatePostMeta'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  labels: {
    singular: '文章',
    plural: '文章',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    description: true,
    category: true,
    publishedAt: true,
  },
  admin: {
    group: '内容',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '标题',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: '摘要',
      admin: {
        description: '文章摘要，用于列表卡片与 SEO 描述',
      },
    },
    {
      name: 'markdown',
      type: 'textarea',
      label: '正文（Markdown）',
      required: true,
      admin: {
        rows: 30,
        description: '使用 Markdown 编写正文，支持代码块、图片与表格',
      },
    },
    {
      name: 'coverUrl',
      type: 'text',
      label: '外链封面',
      admin: {
        description: '填写图片地址后优先于上传封面显示',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      label: '上传封面',
      relationTo: 'media',
      admin: {
        description: '本地上传的封面，仅在未填写外链封面时使用',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      label: '分类',
      relationTo: 'categories',
    },
    {
      name: 'series',
      type: 'text',
      label: '所属系列',
      admin: {
        description: '同系列文章会在侧边栏聚合展示',
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: '标签',
      labels: {
        singular: '标签',
        plural: '标签',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: '标签名',
          required: true,
        },
      ],
    },
    {
      name: 'isPinned',
      type: 'checkbox',
      label: '置顶',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'views',
      type: 'number',
      label: '浏览量',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'wordCount',
      type: 'number',
      label: '字数',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      label: '阅读时长（分钟）',
      admin: {
        description: '随正文自动计算，无需手动填写',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: '发布时间',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    chineseSlugField(),
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterDelete: [revalidateDelete],
    beforeChange: [populatePostMeta],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
    },
    maxPerDoc: 50,
  },
}
