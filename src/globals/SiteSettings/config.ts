import type { GlobalConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '站点设置',
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
              label: '站点名称',
              required: true,
              defaultValue: 'Kira Blog',
            },
            {
              name: 'siteDescription',
              type: 'textarea',
              label: '站点描述',
              admin: {
                description: '用于浏览器标题与社交分享描述',
              },
            },
            {
              name: 'authorName',
              type: 'text',
              label: '作者名称',
            },
            {
              name: 'bio',
              type: 'textarea',
              label: '一句话简介',
              admin: {
                description: '展示在首页欢迎卡、关于页与侧边栏',
              },
            },
            {
              name: 'avatar',
              type: 'upload',
              label: '头像',
              relationTo: 'media',
            },
            {
              name: 'siteStartedAt',
              type: 'date',
              label: '建站日期',
              defaultValue: '2025-02-28',
              admin: {
                description: '用于计算运行天数与站点概览',
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
              label: '背景图',
              labels: {
                singular: '背景图',
                plural: '背景图',
              },
              admin: {
                description: '站点背景图，每次访问随机展示一张',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  label: '图片',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
            {
              name: 'themeColors',
              type: 'array',
              label: '主题色',
              labels: {
                singular: '主题色',
                plural: '主题色',
              },
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'color',
                  type: 'text',
                  label: '颜色值',
                  admin: {
                    description: '十六进制颜色，如 #2563eb',
                  },
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
              label: '社交链接',
              labels: {
                singular: '社交链接',
                plural: '社交链接',
              },
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: '名称',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  label: '链接地址',
                  required: true,
                },
              ],
            },
            {
              name: 'footerText',
              type: 'text',
              label: '页脚文案',
              admin: {
                description: '展示在页脚版权行的补充说明',
              },
            },
            {
              name: 'icp',
              type: 'text',
              label: 'ICP 备案号',
              admin: {
                description: '展示在页脚并链接到工信部备案查询',
              },
            },
            {
              name: 'policeIcp',
              type: 'text',
              label: '公安备案号',
              admin: {
                description: '展示在页脚并链接到公安备案查询',
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
