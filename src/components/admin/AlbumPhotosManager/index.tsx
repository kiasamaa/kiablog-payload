'use client'

import { useDocumentDrawer, useDocumentInfo, useField, useListDrawer } from '@payloadcms/ui'
import { ImagePlus, Images } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import './index.scss'

type MediaRef = {
  alt?: null | string
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
  sort?: null | number
}

const thumbOf = (photo: PhotoDoc): null | string => {
  if (!photo.image || typeof photo.image === 'number') return null
  return photo.image.sizes?.thumbnail?.url || photo.image.url || null
}

const mediaOf = (photo: PhotoDoc): MediaRef | null =>
  photo.image && typeof photo.image === 'object' ? photo.image : null

const captionOf = (photo: PhotoDoc): string => {
  const media = mediaOf(photo)
  return photo.caption || media?.alt || media?.filename || '未命名'
}

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
 * 照片统一存在媒体库，这里只负责「从媒体库挑选」：
 * 新建一张媒体，或从已有图片里多选，选中后生成本相册的照片记录。
 * 这样相册页不再重复上传 / 外链下载，媒体库保持唯一入口。
 */
export const AlbumPhotosManager: React.FC = () => {
  const { id } = useDocumentInfo()
  const albumId = typeof id === 'number' || typeof id === 'string' ? id : null

  const { setValue: setCoverValue, value: coverValue } = useField<number | string | null>({
    path: 'cover',
  })

  const [photos, setPhotos] = useState<PhotoDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [NewMediaDrawer, , { closeDrawer: closeNewMediaDrawer, openDrawer: openNewMediaDrawer }] =
    useDocumentDrawer({
      collectionSlug: 'media',
    })

  const [
    MediaListDrawer,
    ,
    { closeDrawer: closeMediaListDrawer, openDrawer: openMediaListDrawer },
  ] = useListDrawer({
    collectionSlugs: ['media'],
    selectedCollection: 'media',
  })

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
    async (media: MediaRef, sort: number) => {
      if (!albumId) return

      const response = await fetch('/api/photos', {
        body: JSON.stringify({
          album: albumId,
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
          messageFrom(
            await response.json().catch(() => null),
            `添加照片失败（HTTP ${response.status}）`,
          ),
        )
      }
    },
    [albumId],
  )

  const addMedia = useCallback(
    async (mediaDocs: MediaRef[]) => {
      if (!albumId || !mediaDocs.length) return

      setError('')
      setNotice('')

      const existingIDs = new Set(
        photos
          .map((photo) => mediaOf(photo)?.id)
          .filter((id): id is number => typeof id === 'number')
          .map(String),
      )
      const fresh = mediaDocs.filter((media) => !existingIDs.has(String(media.id)))
      const skipped = mediaDocs.length - fresh.length

      if (!fresh.length) {
        setNotice('所选图片已经在相册里了')
        return
      }

      try {
        const startSort = photos.reduce((max, photo) => Math.max(max, photo.sort ?? 0), 0) + 1

        for (let index = 0; index < fresh.length; index += 1) {
          setBusy(`正在添加 ${index + 1}/${fresh.length}`)
          await createPhoto(fresh[index], startSort + index)
        }

        await load()
        setNotice(
          `已添加 ${fresh.length} 张照片${skipped ? `，跳过 ${skipped} 张已在相册中的` : ''}`,
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : '添加照片失败')
      } finally {
        setBusy('')
      }
    },
    [albumId, createPhoto, load, photos],
  )

  const addMediaByIDs = useCallback(
    async (ids: (number | string)[]) => {
      if (!ids.length) return

      try {
        const query = new URLSearchParams({ depth: '0', limit: String(ids.length) })
        ids.forEach((id, index) => query.append(`where[id][in][${index}]`, String(id)))

        const response = await fetch(`/api/media?${query.toString()}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`读取媒体库失败（HTTP ${response.status}）`)
        }

        const json = (await response.json()) as { docs?: MediaRef[] }
        const byID = new Map((json.docs ?? []).map((media) => [String(media.id), media]))
        const selected = ids
          .map((id) => byID.get(String(id)))
          .filter((media): media is MediaRef => Boolean(media))

        await addMedia(selected)
      } catch (err) {
        setError(err instanceof Error ? err.message : '读取媒体库失败')
      }
    },
    [addMedia],
  )

  const removePhoto = async (photo: PhotoDoc) => {
    if (!window.confirm('从相册中移除这张照片？媒体库里的原图不会被删除。')) return

    setBusy('正在移除照片')
    setError('')
    setNotice('')

    try {
      const response = await fetch(`/api/photos/${photo.id}`, {
        credentials: 'include',
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(
          messageFrom(
            await response.json().catch(() => null),
            `移除失败（HTTP ${response.status}）`,
          ),
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
    setNotice('已选为相册封面，记得点击上方的「保存」生效')
  }

  const normalizedCoverID =
    coverValue && typeof coverValue === 'object'
      ? (coverValue as unknown as { id?: number }).id
      : coverValue

  const isCover = (media: MediaRef | null): boolean =>
    Boolean(media && normalizedCoverID != null && String(media.id) === String(normalizedCoverID))

  if (!albumId) {
    return (
      <section className="album-photos album-photos--idle">
        <h3 className="album-photos__title">相册照片</h3>
        <p className="album-photos__tip">先保存这个相册，再回到这里添加照片。</p>
      </section>
    )
  }

  return (
    <>
      <section aria-busy={Boolean(busy)} className="album-photos">
        <header className="album-photos__head">
          <div>
            <h3 className="album-photos__title">
              相册照片
              <span className="album-photos__count">{photos.length}</span>
            </h3>
            <p className="album-photos__tip">照片统一存放在媒体库；可以先上传，再回来多选。</p>
          </div>

          <div className="album-photos__actions">
            <button
              className="album-photos__btn"
              disabled={Boolean(busy)}
              onClick={openNewMediaDrawer}
              type="button"
            >
              <ImagePlus aria-hidden="true" size={14} strokeWidth={1.8} />
              新增图片
            </button>
            <button
              className="album-photos__btn album-photos__btn--primary"
              disabled={Boolean(busy)}
              onClick={openMediaListDrawer}
              type="button"
            >
              <Images aria-hidden="true" size={14} strokeWidth={1.8} />
              从媒体库选择
            </button>
          </div>
        </header>

        {error && (
          <p className="album-photos__msg album-photos__msg--error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="album-photos__msg album-photos__msg--ok" role="status">
            {notice}
          </p>
        )}
        {busy && (
          <p className="album-photos__msg" role="status">
            {busy}…
          </p>
        )}

        {loading ? (
          <p className="album-photos__tip">正在加载照片…</p>
        ) : photos.length === 0 ? (
          <div className="album-photos__placeholder">
            <p className="album-photos__placeholder-title">这个相册还没有照片</p>
            <p className="album-photos__placeholder-hint">
              从媒体库选择已有图片，或新增一张，保存后会自动加入相册。
            </p>
          </div>
        ) : (
          <div className="album-photos__grid">
            {photos.map((photo) => {
              const thumb = thumbOf(photo)
              const media = mediaOf(photo)
              const cover = isCover(media)

              return (
                <figure className="album-photos__item" key={photo.id}>
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="album-photos__thumb" src={thumb} />
                  ) : (
                    <div className="album-photos__thumb album-photos__thumb--empty">无预览</div>
                  )}

                  <figcaption className="album-photos__caption">
                    <span className="album-photos__caption-text">{captionOf(photo)}</span>
                    {cover && <span className="album-photos__badge">封面</span>}
                  </figcaption>

                  <div className="album-photos__tools">
                    <button
                      disabled={Boolean(busy) || !media || cover}
                      onClick={() => pickCover(photo)}
                      type="button"
                    >
                      {cover ? '当前封面' : '设为封面'}
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

      <NewMediaDrawer
        onSave={async ({ doc, operation }) => {
          if (operation !== 'create' || !doc) return
          await addMedia([doc as unknown as MediaRef])
          // 媒体保存后 Edit 视图会切到文档编辑状态，这里主动关掉抽屉回到相册
          closeNewMediaDrawer()
        }}
      />

      <MediaListDrawer
        allowCreate={false}
        enableRowSelections
        onBulkSelect={(selected) => {
          closeMediaListDrawer()
          void addMediaByIDs(Array.from(selected.keys()))
        }}
        onSelect={({ doc }) => {
          closeMediaListDrawer()
          void addMediaByIDs([doc.id])
        }}
      />
    </>
  )
}

export default AlbumPhotosManager
