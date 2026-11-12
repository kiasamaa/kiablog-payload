import type { GlobalConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: '站点',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '基本信息',
          fields: [
            {
              name: 'siteTitle',
              type: 'text',
              required: true,
              defaultValue: 'Kira Blog',
            },
            {
              name: 'siteDescription',
              type: 'textarea',
              admin: {
                description: '用于浏览器标题与社交分享描述',
              },
            },
            {
              name: 'authorName',
              type: 'text',
            },
            {
              name: 'bio',
              type: 'textarea',
              admin: {
                description: '一句话简介，展示在首页与关于页',
              },
            },
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'siteStartedAt',
              type: 'date',
              defaultValue: '2025-02-28',
              admin: {
                description: '建站日期，用于计算运行天数与站点概览',
                date: {
                  pickerAppearance: 'dayOnly',
                },
              },
            },
          ],
        },
        {
          label: '外观',
          fields: [
            {
              name: 'backgroundImages',
              type: 'array',
              admin: {
                description: '站点背景图，随机展示',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
            {
              name: 'themeColors',
              type: 'array',
              fields: [
                {
                  name: 'color',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: '社交与页脚',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'footerText',
              type: 'text',
            },
            {
              name: 'icp',
              type: 'text',
              admin: {
                description: 'ICP 备案号，展示在页脚并链接到工信部备案查询',
              },
            },
            {
              name: 'policeIcp',
              type: 'text',
              admin: {
                description: '公安备案号，展示在页脚并链接到公安备案查询',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}
