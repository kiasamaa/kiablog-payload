'use client'

import { useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import { ExternalLink, Link2 } from 'lucide-react'
import React, { useState } from 'react'

import './index.scss'

type PreviewState = 'failed' | 'idle' | 'loading' | 'ready'

type Props = {
  path: string
  readOnly?: boolean
}

const isHttpUrl = (value: string): boolean => {
  try {
    return /^https?:$/.test(new URL(value).protocol)
  } catch {
    return false
  }
}

/**
 * 媒体库「图片链接」字段。
 *
 * 新建记录有两条入口：上传本地文件，或者只填图片链接。
 * 只填链接时，保存会由 beforeOperation hook 下载原图并沿用 Payload 的尺寸生成流程，
 * 所以这里在提交前先让编辑者看到缩略图和尺寸，链接填错能立刻发现。
 * 编辑已有记录时链接只作为出处展示，不再触发下载。
 */
export const MediaSourceField: React.FC<Props> = ({ path, readOnly }) => {
  const { errorMessage, setValue, showError, value } = useField<string>({ path })
  const { isEditing } = useDocumentInfo()
  const hasLocalFile = useFormFields(([fields]) => Boolean(fields?.file?.value))

  const [previewSrc, setPreviewSrc] = useState('')
  const [previewState, setPreviewState] = useState<PreviewState>('idle')
  const [dimensions, setDimensions] = useState<{ height: number; width: number } | null>(null)
  const [localError, setLocalError] = useState('')

  const current = typeof value === 'string' ? value : ''
  const inputId = `field-${path}`
  const helpId = `${inputId}-help`
  const errorId = `${inputId}-error`

  const invalid = Boolean(localError) || (showError && Boolean(errorMessage))

  const resetPreview = () => {
    setDimensions(null)
    setLocalError('')
    setPreviewSrc('')
    setPreviewState('idle')
  }

  const update = (next: string) => {
    setValue(next)
    resetPreview()
  }

  const preview = () => {
    const trimmed = current.trim()
    if (!trimmed) return

    if (!isHttpUrl(trimmed)) {
      setLocalError('链接需要以 http:// 或 https:// 开头')
      setPreviewSrc('')
      setPreviewState('idle')
      return
    }

    setDimensions(null)
    setLocalError('')
    setPreviewSrc(trimmed)
    setPreviewState('loading')
  }

  if (isEditing) {
    if (!current.trim()) return null

    return (
      <div className="media-source media-source--saved">
        <div className="media-source__head">
          <span className="media-source__label">
            <Link2 aria-hidden="true" size={14} strokeWidth={1.8} />
            原图链接
          </span>
        </div>

        <a
          className="media-source__link"
          href={current}
          rel="noreferrer noopener"
          target="_blank"
          title={current}
        >
          <span className="media-source__link-text">{current}</span>
          <ExternalLink aria-hidden="true" size={13} strokeWidth={1.8} />
        </a>

        <p className="media-source__desc">
          图片已保存到媒体库；此链接仅记录原图地址，不会再次下载。
        </p>
      </div>
    )
  }

  return (
    <div className="media-source">
      <div aria-hidden="true" className="media-source__divider">
        <span>或</span>
      </div>

      <div className="media-source__head">
        <label className="media-source__label" htmlFor={inputId}>
          <Link2 aria-hidden="true" size={14} strokeWidth={1.8} />
          从图片链接导入
        </label>
        <span className="media-source__badge">选填</span>
      </div>

      <div className="media-source__row">
        <input
          aria-describedby={invalid ? `${helpId} ${errorId}` : helpId}
          aria-invalid={invalid}
          autoCapitalize="off"
          autoComplete="off"
          className={`media-source__input${invalid ? ' is-invalid' : ''}`}
          disabled={readOnly}
          id={inputId}
          onBlur={() => {
            if (current.trim() && !isHttpUrl(current.trim())) {
              setLocalError('链接需要以 http:// 或 https:// 开头')
            }
          }}
          onChange={(event) => update(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              preview()
            }
          }}
          placeholder="https://example.com/wallpaper/xxx.webp"
          spellCheck={false}
          type="url"
          value={current}
        />

        <button
          className="media-source__button"
          disabled={readOnly || !current.trim() || previewState === 'loading'}
          onClick={preview}
          type="button"
        >
          {previewState === 'loading' ? '加载中…' : '预览'}
        </button>
      </div>

      <p className="media-source__desc" id={helpId}>
        没有本地图片时填写；保存时会下载原图到媒体库，并生成 7 种尺寸。
      </p>

      {hasLocalFile && (
        <p className="media-source__note" role="status">
          已选择本地文件，这条链接不会生效。
        </p>
      )}

      {invalid && (
        <p className="media-source__hint media-source__hint--error" id={errorId} role="alert">
          {localError || errorMessage}
        </p>
      )}

      {previewState === 'failed' && (
        <p className="media-source__hint media-source__hint--error" role="alert">
          图片无法加载。请确认链接可公开访问，部分图床会拦截站外引用。
        </p>
      )}

      {previewSrc && (previewState === 'loading' || previewState === 'ready') && (
        <div aria-live="polite" className="media-source__preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="链接图片预览"
            className={`media-source__thumb${previewState === 'loading' ? ' is-loading' : ''}`}
            onError={() => {
              setPreviewSrc('')
              setPreviewState('failed')
            }}
            onLoad={(event) => {
              setDimensions({
                height: event.currentTarget.naturalHeight,
                width: event.currentTarget.naturalWidth,
              })
              setPreviewState('ready')
            }}
            src={previewSrc}
          />

          <div className="media-source__meta">
            {previewState === 'loading' ? (
              <span className="media-source__muted">正在加载预览…</span>
            ) : (
              <>
                <span className="media-source__ok">链接有效</span>
                {dimensions && (
                  <span className="media-source__muted">
                    {dimensions.width} × {dimensions.height}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaSourceField
