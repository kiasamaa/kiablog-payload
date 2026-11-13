'use client'

import { useDocumentInfo, useField } from '@payloadcms/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import './index.scss'

type MediaRef = {
  filename?: null | string
  height?: null | number
  id: number
  sizes?: null | Record<string, { url?: null | string } | undefined>
  url?: null | string
  width?: null | number
}

type PhotoDoc = {
  caption?: null | string
  id: number
  image?: MediaRef | number | null
  orientation?: null | string
}

type PreviewState = 'failed' | 'idle' | 'loading' | 'ready'

const thumbOf = (photo: PhotoDoc): null | string => {
  if (!photo.image || typeof photo.image === 'number') return null
  return photo.image.sizes?.thumbnail?.url || photo.image.url || null
}

const mediaOf = (photo: PhotoDoc): MediaRef | null =>
  photo.image && typeof photo.image === 'object' ? photo.image : null

const orientationOf = (media: MediaRef): string | undefined => {
  if (!media.width || !media.height) return undefined
  if (media.width === media.height) return 'square'
  return media.width > media.height ? 'landscape' : 'portrait'
}

const messageFrom = (json: unknown, fallback: string): string => {
  if (json && typeof json === 'object') {
    const record = json as { errors?: { message?: string }[]; message?: string }
    const first = record.errors?.find((item) => item?.message)?.message
    if (first) return first
    if (record.message) return record.message
  }
  return fallback
}

/**
 * 相册详情页里的照片管理区。
 *
 * 相册与照片原本是两个独立集合，需要来回切换页面才能关联；
 * 这里把「看照片 / 加照片 / 设封面 / 移除照片」收进相册这一页。
 */
export const AlbumPhotosManager: React.FC = () => {
  const { id } = useDocumentInfo()
  const albumId = typeof id === 'number' || typeof id === 'string' ? id : null

  const { setValue: setCoverValue } = useField<number | string | null>({ path: 'cover' })

  const [photos, setPhotos] = useState<PhotoDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [showUrlPanel, setShowUrlPanel] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [previewSrc, setPreviewSrc] = useState('')
  const [previewState, setPreviewState] = useState<PreviewState>('idle')

  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    if (!albumId) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/photos?where[album][equals]=${albumId}&limit=300&depth=1&sort=sort`,
        { credentials: 'include' },
      )

      if (!response.ok) throw new Error(`加载照片失败（HTTP ${response.status}）`)

      const json = (await response.json()) as { docs?: PhotoDoc[] }
      setPhotos(json.docs ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载照片失败')
    } finally {
      setLoading(false)
    }
  }, [albumId])

  useEffect(() => {
    void load()
  }, [load])

  const createPhoto = useCallback(
    async (media: MediaRef, caption?: string, sort?: number) => {
      if (!albumId) return

      const response = await fetch('/api/photos', {
        body: JSON.stringify({
          album: albumId,
          caption: caption || undefined,
          image: media.id,
          orientation: orientationOf(media),
          sort,
        }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(
          messageFrom(await response.json().catch(() => null), `添加照片失败（HTTP ${response.status}）`),
        )
      }
    },
    [albumId],
  )

  const handleFiles = async (files: File[]) => {
    if (!files.length) return

    setError('')
    setNotice('')

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]
        setBusy(`正在上传 ${index + 1}/${files.length}`)

        const form = new FormData()
        form.append('file', file)
        form.append('alt', file.name.replace(/\.[^.]+$/, ''))

        const response = await fetch('/api/media', {
          body: form,
          credentials: 'include',
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error(
            messageFrom(await response.json().catch(() => null), `上传失败（HTTP ${response.status}）`),
          )
        }

        const json = (await response.json()) as { doc: MediaRef }
        await createPhoto(json.doc, file.name.replace(/\.[^.]+$/, ''), photos.length + index)
      }

      await load()
      setNotice(`已添加 ${files.length} 张照片`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setBusy('')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const addFromUrl = async () => {
    const url = urlValue.trim()
    if (!url) {
      setError('请先填写图片链接')
      return
    }

    setError('')
    setNotice('')

    try {
      setBusy('正在下载外链图片')

      const response = await fetch('/api/media/import-from-url', {
        body: JSON.stringify({ url }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(
          messageFrom(await response.json().catch(() => null), `下载失败（HTTP ${response.status}）`),
        )
      }

      const json = (await response.json()) as { doc: MediaRef }
      await createPhoto(json.doc, undefined, photos.length)

      setUrlValue('')
      setPreviewSrc('')
      setPreviewState('idle')
      setShowUrlPanel(false)
      await load()
      setNotice('已从外链添加')
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败')
    } finally {
      setBusy('')
    }
  }

  const removePhoto = async (photo: PhotoDoc) => {
    if (!window.confirm('从相册中移除这张照片？媒体库里的原图不会被删除。')) return

    setBusy('正在移除照片')

    try {
      const response = await fetch(`/api/photos/${photo.id}`, {
        credentials: 'include',
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(
          messageFrom(await response.json().catch(() => null), `移除失败（HTTP ${response.status}）`),
        )
      }

      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '移除失败')
    } finally {
      setBusy('')
    }
  }

  const pickCover = (photo: PhotoDoc) => {
    const media = mediaOf(photo)
    if (!media) {
      setError('这张照片缺少媒体信息，无法设为封面')
      return
    }

    // 非多态 upload 字段在表单里的值是关系的 id 本身，传对象会显示成 [object Object]
    setCoverValue(media.id)
    setError('')
    setNotice('已选为相册封面，记得点击下方的「保存」生效')
  }

  if (!albumId) {
    return (
      <section className="album-photos album-photos--idle">
        <h3 className="album-photos__title">相册照片</h3>
        <p className="album-photos__tip">先保存这个相册，再回到这里添加照片。</p>
      </section>
    )
  }

  return (
    <section className="album-photos">
      <header className="album-photos__head">
        <div>
          <h3 className="album-photos__title">
            相册照片
            <span className="album-photos__count">{photos.length}</span>
          </h3>
          <p className="album-photos__tip">
            上传本地图片或粘贴外链，保存时会自动生成各尺寸缩略图。
          </p>
        </div>

        <div className="album-photos__actions">
          <button
            className="album-photos__btn"
            disabled={Boolean(busy)}
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            上传图片
          </button>
          <button
            className="album-photos__btn album-photos__btn--primary"
            disabled={Boolean(busy)}
            onClick={() => setShowUrlPanel((open) => !open)}
            type="button"
          >
            从外链添加
          </button>
        </div>
      </header>

      <input
        accept="image/*"
        hidden
        multiple
        onChange={(event) => {
          const files = event.target.files ? Array.from(event.target.files) : []
          void handleFiles(files)
        }}
        ref={fileRef}
        type="file"
      />

      {showUrlPanel && (
        <div className="album-photos__url">
          <div className="album-photos__row">
            <input
              className="album-photos__input"
              onChange={(event) => {
                setUrlValue(event.target.value)
                setPreviewState('idle')
                setPreviewSrc('')
              }}
              placeholder="https://img.kianexus.com/wallpaper/xxx.webp"
              type="url"
              value={urlValue}
            />
            <button
              className="album-photos__btn"
              disabled={!urlValue.trim()}
              onClick={() => {
                setPreviewState('loading')
                setPreviewSrc(urlValue.trim())
              }}
              type="button"
            >
              预览
            </button>
            <button
              className="album-photos__btn album-photos__btn--primary"
              disabled={Boolean(busy) || !urlValue.trim()}
              onClick={addFromUrl}
              type="button"
            >
              添加
            </button>
          </div>

          {previewSrc && previewState !== 'idle' && (
            <div className="album-photos__preview">
              {previewState !== 'failed' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="外链预览"
                  className={`album-photos__preview-img${previewState === 'loading' ? ' is-loading' : ''}`}
                  onError={() => setPreviewState('failed')}
                  onLoad={() => setPreviewState('ready')}
                  src={previewSrc}
                />
              )}
              {previewState === 'failed' && (
                <span className="album-photos__msg album-photos__msg--error">
                  图片无法加载，请确认链接可公开访问
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="album-photos__msg album-photos__msg--error">{error}</p>}
      {notice && <p className="album-photos__msg album-photos__msg--ok">{notice}</p>}
      {busy && <p className="album-photos__msg">{busy}…</p>}

      {loading ? (
        <p className="album-photos__tip">正在加载照片…</p>
      ) : photos.length === 0 ? (
        <div className="album-photos__placeholder">这个相册还是空的，先加几张照片吧。</div>
      ) : (
        <div className="album-photos__grid">
          {photos.map((photo) => {
            const thumb = thumbOf(photo)

            return (
              <figure className="album-photos__item" key={photo.id}>
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="album-photos__thumb" src={thumb} />
                ) : (
                  <div className="album-photos__thumb album-photos__thumb--empty">无预览</div>
                )}

                <figcaption className="album-photos__caption">
                  {photo.caption || '未命名'}
                </figcaption>

                <div className="album-photos__tools">
                  <button onClick={() => pickCover(photo)} type="button">
                    设为封面
                  </button>
                  <button
                    className="is-danger"
                    disabled={Boolean(busy)}
                    onClick={() => void removePhoto(photo)}
                    type="button"
                  >
                    移除
                  </button>
                </div>
              </figure>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default AlbumPhotosManager
