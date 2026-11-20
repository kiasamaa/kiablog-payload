'use client'

import { useDocumentInfo, useForm } from '@payloadcms/ui'
import { AlertCircle, CheckCircle2, FileUp, Loader2 } from 'lucide-react'
import React, { useRef, useState } from 'react'

import { parseDate, parseMarkdown, summarize } from '@/utilities/parseMarkdown'

import './index.scss'

type Status = {
  kind: 'idle' | 'ok' | 'warn' | 'error'
  message: string
}

const isHttpUrl = (value?: string) => Boolean(value && /^https?:\/\//i.test(value))

/** 生成六位随机数字 slug，并确保同一集合内没有被占用 */
const takeRandomSlug = async (currentId?: number | string): Promise<string> => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = String(Math.floor(100000 + Math.random() * 900000))
    const params = new URLSearchParams({
      'where[slug][equals]': candidate,
      depth: '0',
      limit: '1',
    })

    if (currentId !== undefined && currentId !== null) {
      params.set('where[id][not_equals]', String(currentId))
    }

    try {
      const response = await fetch(`/api/posts?${params.toString()}`)

      if (!response.ok) continue

      const json = await response.json()

      if ((json.docs || []).length === 0) return candidate
    } catch {
      // 查询失败换一个候选重试
    }
  }

  throw new Error('暂时无法生成唯一路径，请稍后重试')
}

/**
 * 文章编辑页顶部的 Markdown 导入器。
 * 新建与编辑都可用：读取 .md 的 front matter，覆盖标题/摘要/正文/分类/系列/
 * 标签/发布时间/外链封面，slug 交给已有的自动生成逻辑。
 */
export const MarkdownImport: React.FC = () => {
  const { id } = useDocumentInfo()
  const { addFieldRow, dispatchFields, getField, removeFieldRow } = useForm()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' })
  const [loading, setLoading] = useState(false)

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    setLoading(true)
    setStatus({ kind: 'idle', message: '' })

    try {
      const { content, data, filenameTitle } = parseMarkdown(await file.text(), file.name)

      if (!content) throw new Error('Markdown 正文为空，未导入')

      const title = data.title || filenameTitle

      // 关闭自动生成，写入查重后的六位随机 slug
      const slug = await takeRandomSlug(id)

      dispatchFields({ type: 'UPDATE', path: 'title', value: title })
      dispatchFields({ type: 'UPDATE', path: 'generateSlug', value: false })
      dispatchFields({ type: 'UPDATE', path: 'slug', value: slug })
      dispatchFields({
        type: 'UPDATE',
        path: 'description',
        value: data.description || summarize(content),
      })
      dispatchFields({ type: 'UPDATE', path: 'markdown', value: content })
      dispatchFields({ type: 'UPDATE', path: 'series', value: data.series || '' })
      dispatchFields({
        type: 'UPDATE',
        path: 'publishedAt',
        value: parseDate(data.date) || null,
      })
      dispatchFields({
        type: 'UPDATE',
        path: 'coverUrl',
        value: isHttpUrl(data.cover) ? data.cover : '',
      })

      // tags 是数组：先清空旧行，再逐行添加，保证表单状态与 UI 一致。
      // 行数必须在事件里实时读，selector 在连续 dispatch 时可能拿到过期值。
      const existingRows = getField('tags')?.rows?.length || 0

      for (let index = existingRows - 1; index >= 0; index -= 1) {
        removeFieldRow({ path: 'tags', rowIndex: index })
      }

      data.tags.forEach((tag, index) => {
        addFieldRow({
          path: 'tags',
          rowIndex: index,
          schemaPath: 'tags',
          subFieldState: { tag: { valid: true, value: tag } },
        })
      })

      // category 是关系字段：按标题精确匹配现有分类，匹配不到就跳过并提示
      const unmatched: string[] = []
      let categoryId: number | string | null = null

      for (const name of data.categories) {
        try {
          const response = await fetch(
            `/api/categories?where[title][equals]=${encodeURIComponent(name)}&limit=1&depth=0`,
          )
          const json = response.ok ? await response.json() : null
          const match = json?.docs?.[0]

          if (match) {
            if (categoryId === null) categoryId = match.id
          } else {
            unmatched.push(name)
          }
        } catch {
          unmatched.push(name)
        }
      }

      dispatchFields({ type: 'UPDATE', path: 'category', value: categoryId })

      setStatus({
        kind: unmatched.length ? 'warn' : 'ok',
        message: unmatched.length
          ? `已导入「${title}」；未匹配分类：${unmatched.join('、')}`
          : `已导入「${title}」`,
      })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : '导入失败',
      })
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="markdown-import">
      <input
        accept=".md,.markdown,text/markdown"
        className="markdown-import__input"
        onChange={handleFile}
        ref={inputRef}
        type="file"
      />

      <button
        className="markdown-import__button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {loading ? <Loader2 className="markdown-import__spin" size={14} /> : <FileUp size={14} />}
        {loading ? '导入中…' : '导入 Markdown'}
      </button>

      {status.kind !== 'idle' ? (
        <span className={`markdown-import__status markdown-import__status--${status.kind}`}>
          {status.kind === 'ok' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {status.message}
        </span>
      ) : null}
    </div>
  )
}

export default MarkdownImport
