import type { GlobalConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { revalidateAbout } from './hooks/revalidateAbout'

export const About: GlobalConfig = {
  slug: 'about',
  label: '关于页',
  access: {
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: '站点',
  },
  fields: [
    {
      name: 'intro',
      type: 'textarea',
      label: '自我介绍',
      admin: {
        description: '关于页的自我介绍，换行即分段',
      },
    },
    {
      name: 'motto',
      type: 'text',
      label: '座右铭',
      admin: {
        description: '展示在简介右侧的小卡片里',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'locationPlace',
          type: 'text',
          label: '所在位置',
          admin: {
            description: '如：湖南省，长沙市',
            width: '50%',
          },
        },
        {
          name: 'locationImageUrl',
          type: 'text',
          label: '位置背景图',
          admin: {
            description: '位置卡片背景图，如 /images/location.png',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'gears',
      type: 'array',
      label: '我的装备',
      labels: {
        singular: '装备',
        plural: '装备',
      },
      admin: {
        description: '按时间倒序展示',
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'date',
              type: 'text',
              label: '入手时间',
              admin: {
                width: '30%',
              },
            },
            {
              name: 'model',
              type: 'text',
              label: '型号',
              admin: {
                width: '70%',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'hobbies',
      type: 'array',
      label: '爱好卡片',
      labels: {
        singular: '爱好',
        plural: '爱好',
      },
      admin: {
        description: '每张卡可以放多组内容',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: '卡片名称',
          required: true,
        },
        {
          name: 'slides',
          type: 'array',
          label: '内容组',
          labels: {
            singular: '内容',
            plural: '内容',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: '标题',
            },
            {
              name: 'text',
              type: 'textarea',
              label: '正文',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateAbout],
  },
}
