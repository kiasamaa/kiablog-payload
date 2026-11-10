import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>欢迎回来</h4>
      </Banner>

      <ul className={`${baseClass}__instructions`}>
        <li>
          在「内容 → 文章」中用 Markdown 撰写正文，保存并发布后前台即可访问
          <code>/posts/&lt;slug&gt;</code>。
        </li>
        <li>在「照片墙 → 相册 / 照片」中维护相册与照片，前台按相册分组展示。</li>
        <li>在「站点 → 站点设置」中修改站点名称、简介、背景图、社交链接与备案信息。</li>
        <li>
          <a href="/" rel="noopener noreferrer" target="_blank">
            查看前台站点
          </a>
        </li>
      </ul>
    </div>
  )
}

export default BeforeDashboard
