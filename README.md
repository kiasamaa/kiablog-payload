<div align="center">

# Kia Blog

**基于 Payload CMS 3 + Next.js 16 的个人博客底座**

毛玻璃视觉、Markdown 写作、后台可视化管理的一家之言之地。

![Next.js](https://img.shields.io/badge/Next.js-16-000000)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Payload](https://img.shields.io/badge/Payload-3-2D2D2D)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57)
![License](https://img.shields.io/badge/License-MIT-22C55E)

[简介](#简介) · [效果展示](#效果展示) · [功能特性](#功能特性) · [快速开始](#快速开始) · [项目结构](#项目结构) · [部署](#部署)

</div>

---

## 简介

Kia Blog 是一个开箱即用的个人博客模板：前台是深色优先的「星光玻璃」风格站点，后台是 Payload 提供的可视化内容管理面板，两者运行在同一个 Next.js 应用里，无需单独部署后端。

项目基于 `create-payload-app` 的 website 模板重新搭建前台，去掉了页面构建器，保留并重建了真正需要的那部分：

- **写作为中心** — 文章正文使用 Markdown，编辑器里粘贴源码即可，不用学富文本区块
- **内容可维护** — 文章、分类、相册、照片、站点信息全部在 `/admin` 里增删改
- **视觉统一** — 毛玻璃卡片、大圆角、柔和渐变、深浅色切换，动效克制不喧宾夺主
- **结构清晰** — 服务端取数 + 客户端交互分层，集合/全局/路由各归其位，便于继续扩展

## 效果展示

> **待补充**：截图建议放在 `docs/images/` 下，命名如 `home.png`、`posts.png`、`post-detail.png`、`photowall.png`、`admin.png`。

| 页面 | 截图 |
|:-----|:-----|
| 首页 | `docs/images/home.png`（待补充） |
| 文章列表 | `docs/images/posts.png`（待补充） |
| 文章详情 | `docs/images/post-detail.png`（待补充） |
| 照片墙 | `docs/images/photowall.png`（待补充） |
| 管理后台 | `docs/images/admin.png`（待补充） |

## 功能特性

### 博客前台

| 模块 | 路径 | 说明 |
|:-----|:-----|:-----|
| 首页 | `/` | 站点介绍与文章、照片墙入口 |
| 文章列表 | `/posts`、`/hots` | 统一骨架：标题 + 页签栏（全部 / 热门 / 分类或标签）+ 分批加载更多；热门按浏览量排序 |
| 文章详情 | `/posts/[slug]` | Markdown 渲染、代码高亮与复制、图片灯箱、阅读进度、相关文章 |
| 照片墙 | `/photowall` | 相册卡片、网格内展开、全屏灯箱（←/→ 切换、Esc 关闭、缩略图条） |
| 分类 | `/categories`、`/categories/[slug]` | 分类总览（各分类最近 6 篇）与单分类列表，页签栏选中对应分类 |
| 标签 | `/tags`、`/tags/[slug]` | 标签总览与单标签列表，页签栏切换为标签场景 |
| 搜索 | `/search` | 标题 / 摘要 / 标签模糊匹配，空关键词时返回全部文章 |
| 关于 | `/about` | 自我介绍、位置、装备清单与爱好卡片 |
| 导航 | — | 顶部通栏 → 滚动收拢为毛玻璃胶囊、下滑隐藏上滑出现；分类下拉、正在阅读、搜索、回顶、工作台 |
| 侧边栏 | — | 文章列表：站点信息 / 标签 / 网站信息；文章详情：站点信息 / 目录 / 系列 / 最新文章；吸附跟随、目录滚动高亮、可一键折叠 |
| 工作台 | — | 最近更新、热门文章（按浏览量）、热门标签、站点概览；底部主题 / 快捷键 / 侧边栏开关 |
| 右键菜单 | — | 前进/后退/刷新/回顶、随机文章、复制地址、深浅色、复制选中文字、必应搜索、复制链接、复制/下载图片 |
| 主题 | — | 深色优先，手动切换并记忆到 `localStorage`，首屏无闪烁 |
| 响应式 | — | 桌面 / 平板 / 手机三档，移动端抽屉导航 |

### 管理后台

| 集合 / 全局 | 用途 |
|:------------|:-----|
| `posts` | 文章：Markdown 正文、封面、分类、标签、置顶、浏览量、自动字数与阅读时长、草稿与定时发布 |
| `categories` | 文章分类，带排序 |
| `albums` | 相册：标题、简介、封面、排序 |
| `photos` | 照片：所属相册、图片、说明、方向、排序 |
| `media` | 上传媒体，自动生成 7 种尺寸，支持目录与焦点裁剪 |
| `users` | 后台账号（仅管理用途，前台无登录） |
| `site-settings` | 站点名称、简介、作者、头像、背景图、主题色、社交链接、备案信息 |
| `about` | 关于页：自我介绍、座右铭、位置、装备清单、爱好卡片 |

### 工程能力

- **草稿预览**：`/next/preview` 校验密钥 + 登录态后开启 `draftMode`，配合 Payload Live Preview 实时刷新
- **按需重验证**：文章、相册、站点设置保存后通过 `revalidatePath` / `revalidateTag` 精确失效缓存
- **SEO**：Payload SEO 插件管理 `meta` 字段，`generateMeta` 输出 Open Graph；`/posts-sitemap.xml` 动态生成
- **类型安全**：`pnpm generate:types` 从配置生成 `payload-types.ts`，前台直接消费
- **测试**：Vitest 集成测试 + Playwright 端到端测试

## 技术栈

<table>
<tr>
<td width="50%" valign="top">

**框架与 CMS**

- Next.js 16（App Router / Turbopack）
- React 19
- Payload CMS 3
- TypeScript 5
- SQLite（`@payloadcms/db-sqlite`）

</td>
<td width="50%" valign="top">

**样式与交互**

- Tailwind CSS 4
- shadcn/ui
- Framer Motion
- lucide-react
- marked + marked-highlight + highlight.js

</td>
</tr>
</table>

## 快速开始

### 环境要求

- Node.js `^22.23.4` 或 `>=24.22.1`
- pnpm `^9` / `^10` / `^11`

### 本地运行

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，至少修改 PAYLOAD_SECRET

# 3. 启动开发服务器
pnpm dev
```

打开 `http://localhost:3000` 查看前台，`http://localhost:3000/admin` 创建第一个管理员账号。

### 填充演示数据

```bash
pnpm seed
```

脚本会写入 3 个分类、3 篇示例文章与 1 个相册（不包含照片，照片需自行上传）。**该命令会清空现有的文章、分类、相册与照片**，仅在初始化时使用。

### 常用命令

| 命令 | 说明 |
|:-----|:-----|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建（含 sitemap 生成） |
| `pnpm start` | 以生产模式启动 |
| `pnpm seed` | 填充演示数据 |
| `pnpm import:hexo` | 从同级 `hexo/source/_posts` 导入文章（可用 `HEXO_POSTS_DIR` 指定目录） |
| `pnpm import:profile` | 写入站点信息、头像与关于页内容 |
| `pnpm generate:types` | 修改集合字段后重新生成类型 |
| `pnpm generate:importmap` | 修改后台自定义组件后重新生成 importMap |
| `pnpm test:int` | 运行 Vitest 集成测试 |
| `pnpm test:e2e` | 运行 Playwright 端到端测试 |

### 环境变量

| 变量 | 必填 | 说明 |
|:-----|:-----|:-----|
| `DATABASE_URL` | 是 | SQLite 文件地址，默认 `file:./kiasite.db` |
| `PAYLOAD_SECRET` | 是 | JWT 签名密钥，建议 `openssl rand -hex 32` |
| `NEXT_PUBLIC_SERVER_URL` | 是 | 站点公开地址，用于 CORS、绝对链接与 SEO |
| `PREVIEW_SECRET` | 否 | 草稿预览校验密钥 |
| `CRON_SECRET` | 否 | 定时任务访问密钥 |

## 项目结构

```txt
.
├── src/
│   ├── access/                 # 访问控制：anyone / authenticated / authenticatedOrPublished
│   ├── app/
│   │   ├── (frontend)/         # 前台路由：首页、文章、照片墙、关于、404
│   │   │   ├── layout.tsx      # 字体、主题脚本、导航、页脚、背景
│   │   │   ├── globals.css     # Tailwind 4 主题与毛玻璃工具类
│   │   │   ├── posts/          # 列表（Server）+ 交互（PostsClient）
│   │   │   └── photowall/      # 相册聚合（Server）+ 展开与灯箱（Client）
│   │   └── (payload)/          # 后台与 REST/GraphQL（Payload 生成，勿手改）
│   ├── collections/            # Posts / Categories / Albums / Photos / Media / Users
│   ├── globals/                # SiteSettings 站点设置
│   ├── components/
│   │   ├── layout/             # Navbar / Footer / SiteBackground
│   │   ├── posts/              # PostCard / MarkdownContent
│   │   ├── providers/          # ThemeProvider
│   │   └── ui/                 # Lightbox / ReadingProgress / shadcn 基础组件
│   ├── endpoints/seed/         # 演示数据
│   ├── plugins/                # SEO / Redirects 插件配置
│   ├── utilities/              # markdown / formatDate / getMediaUrl / generateMeta 等
│   ├── payload.config.ts       # Payload 总配置
│   └── payload-types.ts        # 生成的文件，勿手改
├── public/                     # 静态资源与上传目录 public/media
├── scripts/seed.ts             # pnpm seed 入口
├── tests/                      # Vitest 与 Playwright 测试
└── next.config.ts              # withPayload 包装与图片域名配置
```

## 内容维护

1. **写文章**：后台「内容 → 文章」→ 填写标题、摘要、Markdown 正文 → 选择分类、填标签 → 发布
2. **建相册**：后台「照片墙 → 相册」创建相册并上传封面
3. **传照片**：后台「照片墙 → 照片」选择所属相册并上传图片，可设置方向与排序
4. **调站点**：后台「站点 → 站点设置」修改站点名、简介、背景图、社交链接与备案

> 文章正文支持标准 Markdown 与围栏代码块；「摘要」会显示在列表卡片并作为默认 SEO 描述。

## 部署

### 自托管

```bash
pnpm build
pnpm start
```

注意两点：

- `.env` 中的 `DATABASE_URL` 与实际运行的数据库文件保持一致
- `public/media/` 是上传目录，部署时需要持久化，否则重启会丢失图片

### Docker

```bash
cp .env.example .env
docker compose up
```

### 数据库变更

本地开发时 Payload 会自动把 schema 同步到 SQLite。若已有数据且改动较大，建议先备份 `kiasite.db` 再启动；生产环境请使用 Payload 的 migration 流程（`pnpm payload migrate:create` / `pnpm payload migrate`）。

## 开发约定

- **改集合字段** → 执行 `pnpm generate:types`，否则类型不匹配
- **改后台自定义组件** → 执行 `pnpm generate:importmap`，否则后台会报组件解析失败
- **新增页面** → 放在 `src/app/(frontend)/` 下，默认沿用 `layout.tsx` 的导航与背景
- **新增集合** → `src/collections/` 下建目录 → 注册到 `payload.config.ts` → 补访问控制
- **前台取数** → 在 Server Component 里用 `getPayload()` + Local API，客户端组件只接收序列化后的 props

## 路线图

- [x] 顶部导航与深浅色主题
- [x] 胶囊收拢导航、下滑隐藏 / 上滑出现、分类下拉与中控台
- [x] 自定义右键菜单（四形态）
- [x] 文章列表与分类筛选
- [x] Markdown 文章详情、代码高亮、Mermaid 图表、KaTeX 公式、图片灯箱、阅读进度
- [x] 照片墙与全屏灯箱
- [x] 统一文章列表骨架（全部 / 热门 / 分类 / 标签页签）
- [x] 分类与标签总览页
- [x] 站内搜索
- [x] 后台内容管理与按需重验证
- [ ] 标签独立页面
- [ ] 归档时间线
- [ ] RSS 订阅
- [ ] 评论系统
- [ ] 音乐播放器

## 贡献

欢迎提 Issue 与 Pull Request。提交前请确保：

```bash
pnpm build
pnpm test:int
```

## License

[MIT](./LICENSE)

## 致谢

- [Payload CMS](https://payloadcms.com) — 内容管理内核与 website 模板
- [Next.js](https://nextjs.org) — 应用框架
- [shadcn/ui](https://ui.shadcn.com) — 基础组件
- [Kirameku](https://github.com/Xinghongia/Kirameku) — 前台视觉与交互的参考来源之一
