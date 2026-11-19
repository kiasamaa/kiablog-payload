export type AlbumPhoto = {
  id: number
  src: string
  thumbSrc: string
  width: number
  height: number
  caption?: string | null
  orientation?: string | null
  /** 原作者署名，来自媒体库的 author 字段 */
  author?: string | null
  /** 来源，可能是 URL 或站点名，来自媒体库的 source 字段 */
  source?: string | null
}

export type AlbumData = {
  id: number
  title: string
  description?: string | null
  coverUrl?: string | null
  photos: AlbumPhoto[]
}
