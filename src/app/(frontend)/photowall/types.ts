export type AlbumPhoto = {
  id: number
  src: string
  thumbSrc: string
  width: number
  height: number
  caption?: string | null
  orientation?: string | null
}

export type AlbumData = {
  id: number
  title: string
  description?: string | null
  coverUrl?: string | null
  photos: AlbumPhoto[]
}
