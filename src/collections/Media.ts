import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { importImageFromUrlEndpoint } from '../endpoints/media/importFromUrl'
import { downloadSourceUrlOnCreate } from './Media/hooks/downloadSourceUrl'
import { fillAltFromFilename } from './Media/hooks/fillAltFromFilename'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isHttpUrl = (value?: string | null): string | true => {
  if (!value) return true

  try {
    const parsed = new URL(value)
    return /^https?:$/.test(parsed.protocol) ? true : '只支持 http/https 链接'
  } catch {
    return '链接格式不正确，请填写完整地址'
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: '媒体',
    plural: '媒体库',
  },
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: '内容',
    defaultColumns: ['filename', 'sourceUrl', 'author', 'updatedAt'],
    components: {
      edit: {
        // 新建保存后回列表，而不是停在文档编辑页
        SaveButton: '@/components/admin/MediaSaveButton',
      },
    },
  },
  hooks: {
    beforeOperation: [downloadSourceUrlOnCreate],
    beforeChange: [fillAltFromFilename],
  },
  endpoints: [importImageFromUrlEndpoint],
  fields: [
    {
      name: 'sourceUrl',
      type: 'text',
      label: '图片链接',
      validate: isHttpUrl,
      admin: {
        description: '没有本地图片时填写图床原图地址，保存时会自动下载到媒体库',
        components: {
          Field: '@/components/admin/MediaSourceField',
        },
      },
    },
    {
      name: 'alt',
      type: 'text',
      label: '替代文本',
      admin: {
        description:
          '图片无法显示时展示的文字，也用于无障碍阅读；留空时默认使用文件名（不含扩展名）',
        placeholder: '例如：海边的日落',
      },
    },
    {
      name: 'author',
      type: 'text',
      label: '原作者',
      admin: {
        description: '选填，壁纸/插图的作者署名',
        position: 'sidebar',
      },
    },
    {
      name: 'source',
      type: 'text',
      label: '来源',
      admin: {
        description: '选填，原图出处（页面链接或站点名）',
        position: 'sidebar',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      label: '图注',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    // 允许"只填外链"创建：文件由 downloadSourceUrlOnCreate 在写库前补齐
    filesRequiredOnCreate: false,
    // 原生「粘贴网址」与下方自定义外链字段重复，关掉避免两个入口
    pasteURL: false,
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
