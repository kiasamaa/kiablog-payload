'use client'

import { useField } from '@payloadcms/ui'
import React, { useState } from 'react'

import './index.scss'

type PreviewState = 'failed' | 'idle' | 'loading' | 'ready'

type Props = {
  path: string
  readOnly?: boolean
}

/**
 * 媒体库「外链地址」字段的交互组件。
 *
 * 创建记录时有两种入口：上传本地文件，或者只填这个外链。
 * 只填外链时，保存动作会由 beforeOperation hook 下载图片并作为本条记录的文件，
 * 所以这里提供预览按钮，让链接填错的一瞬间就能看出来。
 */
export const MediaSourceField: React.FC<Props> = ({ path, readOnly }) => {
  const { errorMessage, setValue, showError, value } = useField<string>({ path })

  const [previewSrc, setPreviewSrc] = useState('')
  const [previewState, setPreviewState] = useState<PreviewState>('idle')

  const current = typeof value === 'string' ? value : ''

  const update = (next: string) => {
    setValue(next)
    setPreviewState('idle')
    setPreviewSrc('')
  }

  const preview = () => {
    if (!current.trim()) return
    setPreviewState('loading')
    setPreviewSrc(current.trim())
  }

  return (
    <div className="media-source">
      <div className="media-source__head">
        <label className="media-source__label" htmlFor={`field-${path}`}>
          外链地址
        </label>
        <span className="media-source__badge">选填</span>
      </div>

      <div className="media-source__row">
        <input
          className="media-source__input"
          disabled={readOnly}
          id={`field-${path}`}
          onChange={(event) => update(event.target.value)}
          placeholder="https://img.kianexus.com/wallpaper/xxx.webp"
          type="url"
          value={current}
        />

        <button
          className="media-source__button"
          disabled={readOnly || !current.trim()}
          onClick={preview}
          type="button"
        >
          预览
        </button>
      </div>

      <p className="media-source__desc">
        不选本地图片时，填这里即可：保存时会自动下载到媒体库，并记录外链地址。
      </p>

      {showError && <p className="media-source__hint media-source__hint--error">{errorMessage}</p>}

      {previewState !== 'idle' && previewSrc && (
        <div className="media-source__preview">
          {previewState !== 'failed' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="外链预览"
              className={`media-source__image${previewState === 'loading' ? ' is-loading' : ''}`}
              onError={() => setPreviewState('failed')}
              onLoad={() => setPreviewState('ready')}
              src={previewSrc}
            />
          )}

          {previewState === 'loading' && <span className="media-source__hint">正在加载预览…</span>}

          {previewState === 'ready' && (
            <span className="media-source__hint media-source__hint--ok">链接有效</span>
          )}

          {previewState === 'failed' && (
            <span className="media-source__hint media-source__hint--error">
              图片无法加载，请确认链接可公开访问（部分图床有防盗链）
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default MediaSourceField
