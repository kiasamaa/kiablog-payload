# AGENTS.md

给 AI agent 的项目说明。开工前先读完本文件，再按需加载 `.agents/skills/` 下的 skill。

## 项目概览

个人博客站点 **kiasite**：Payload CMS 3 与前端同跑在一个 Next.js 应用里。

| 项目 | 版本 / 位置 |
|:--|:--|
| Payload CMS | 3.93.0（`src/payload.config.ts`） |
| Next.js / React | 16 / 19（App Router + Turbopack） |
| 数据库 | SQLite，`kiasite.db`（`@payloadcms/db-sqlite`，`DATABASE_URL`） |
| 样式 | Tailwind CSS 4 + shadcn/ui + 少量自定义 SCSS（后台组件） |
| 包管理 | pnpm（Node ^22.23.4 或 >=24.22.1） |
| 语言 | 代码注释、提交信息、后台界面均为中文 |

## 常用命令

```bash
pnpm dev                  # 开发服务器（localhost:3000，后台 /admin）
pnpm build                # 生产构建（会覆盖 .next，正在跑的 dev server 会失效）
pnpm start                # 生产模式启动

pnpm generate:types       # 改集合/全局字段后必须执行
pnpm generate:importmap   # 改后台自定义组件后必须执行
pnpm seed                 # 填充演示数据（会清空文章/分类/相册/照片）
pnpm payload migrate:create / migrate
```

自检：`npx tsc --noEmit`。**不要**用 `pnpm lint` 作为验收标准，`eslint.config.mjs` 加载 `@eslint/eslintrc` 时会报 circular structure，是既有问题。

## 目录结构

```txt
src/
├── app/
│   ├── (frontend)/          # 前台：首页、/posts、/hots、/categories、/tags、/search、/photowall、/about
│   └── (payload)/           # 后台与 REST/GraphQL，Payload 生成，勿手改
├── collections/
│   ├── Posts/               # 文章（Markdown 正文、封面、分类、标签、浏览量、草稿）
│   ├── Categories/          # 分类
│   ├── Albums/              # 相册（cover 封面、sort；后台详情页内嵌照片管理）
│   ├── Photos/              # 照片（album / image / caption / orientation / sort），后台侧边栏已隐藏
│   ├── Media/               # 上传媒体，7 种尺寸；hooks/downloadSourceUrl.ts 支持外链入库
│   └── Users/               # 后台账号
├── globals/                 # SiteSettings、About
├── components/
│   ├── admin/               # 后台自定义组件（见下表）
│   ├── layout/              # Navbar / Footer / 侧边栏 / 工作台
│   ├── posts/  ├── ui/  ├── providers/  ├── site/
├── endpoints/
│   ├── media/importFromUrl.ts   # POST /api/media/import-from-url，外链下载入库
│   └── seed/
├── fields/chineseSlugField.ts   # 中文标题 → slug 生成
├── utilities/               # markdown、formatDate、getMediaUrl、generateMeta…
├── payload.config.ts        # 总配置（admin.i18n 为中文）
└── payload-types.ts         # 生成文件，勿手改
```

### 后台自定义组件（改完必须 `pnpm generate:importmap`）

| 组件 | 挂载点 | 作用 |
|:--|:--|:--|
| `admin/AlbumTitleCell` | `albums.title` 的 `admin.components.Cell` | 相册列表第一列：缩略图 + 名称，整格自带 `<a>` 链接（Payload 只给第一列加链接，自定义 Cell 必须自己渲染） |
| `admin/AlbumPhotosManager` | `albums.photosManager`（`type: 'ui'`） | 相册详情页内的照片网格：上传 / 外链添加 / 设为封面 / 删除 |
| `admin/MediaSourceField` | `media.sourceUrl` 的 `admin.components.Field` | 外链地址输入 + 预览，保存时由 `beforeOperation` 下载入库 |

## 关键约定与坑

- **改字段** → `pnpm generate:types`；**改后台组件** → `pnpm generate:importmap`；两者漏了会类型报错或后台组件解析失败。
- **前台取数** 走 Server Component + `getPayload()` Local API，客户端组件只接序列化 props；不要在前台组件里直接 `fetch('/api/...')` 取内容。
- **上传目录** `public/media/` 与 `kiasite.db` 不入版本库，换机/部署需自行保留。
- **非多态 upload 字段**（如 `albums.cover`）在表单里的值是关系 **id**，写对象会显示 `[object Object]`。
- **Payload 列表只有第一列带链接**，所以列表缩略图要和标题同列，否则整行不可点。
- **Media 外链导入**：`upload.filesRequiredOnCreate: false` + `hooks.beforeOperation` 里给 `req.file` 赋值，复用原生存盘/裁剪逻辑；外链下载有 http(s)、内网拦截、≤20MB、15s 超时、拒绝 SVG 的校验（`src/endpoints/media/importFromUrl.ts`）。
- **后台文案**：新增插件/集合记得补 `labels` 与 `admin.i18n.translations` 中文，否则界面出现 translation key。
- **dev server** 在 Windows 上曾因配置文件改动整批重载而退出（日志 `Command failed with exit code 1`）。发现 3000 端口不通先看 `dev.log` / `dev.err.log`，必要时重启。

## 可用 Skill（`.agents/skills/`）

| Skill | 何时加载 |
|:--|:--|
| `payload` | 改动集合、字段、hook、access、endpoint、或排查 Payload 报错时。先读 `payload/SKILL.md`，细节在 `payload/reference/*.md` |
| `frontend-design` | 新建或重塑页面的视觉方向（配色、字体、版式）时 |
| `ui-ux-pro-max` | 需要具体 UI/UX 决策时：样式库、产品配色、字体配对、UX 规范、图标、图表、22 种技术栈实现。脚本需 Python 3，Windows 上用 `python` 而非 `python3` |
| `motion` | 写动画 / 过渡时（Motion for React、CSS 动画、spring 参数、性能审计） |

优先级：动内容模型 → `payload`；动视觉 → `frontend-design` + `ui-ux-pro-max`；动交互 → `motion`。三者叠加时先定结构再定视觉再定动效。

## 交付前自检

1. `npx tsc --noEmit` 无输出
2. 改过字段/组件 → 类型与 importMap 已重新生成
3. 涉及后台交互的改动 → 在 `/admin` 实际点一遍（列表可点进详情、字段值正确、无控制台报错）
4. 清理临时脚本、测试数据、临时管理员账号
