import type { GlobalConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { revalidateAbout } from './hooks/revalidateAbout'

export const About: GlobalConfig = {
  slug: 'about',
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
      admin: {
        description: '关于页的自我介绍，换行即分段',
      },
    },
    {
      name: 'motto',
      type: 'text',
      admin: {
        description: '座右铭，展示在简介右侧的小卡片里',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'locationPlace',
          type: 'text',
          admin: {
            description: '如：湖南省，长沙市',
            width: '50%',
          },
        },
        {
          name: 'locationImageUrl',
          type: 'text',
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
      admin: {
        description: '我的装备，按时间倒序展示',
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'date',
              type: 'text',
              admin: {
                width: '30%',
              },
            },
            {
              name: 'model',
              type: 'text',
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
      admin: {
        description: '爱好卡片，每张卡可以放多组内容',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'slides',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'text',
              type: 'textarea',
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
