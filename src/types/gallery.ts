export type GalleryItemType = 'image' | 'video'

export interface GalleryItem {
  id: string
  type: GalleryItemType
  src: string
  srcMd?: string
  srcSm?: string
  alt?: string
  caption?: string
  poster?: string
}

export type GalleryLayout = 'grid'
export type GalleryColumns = 2 | 3 | 4

export function createGalleryItem(
  type: GalleryItemType,
  src: string,
  extra?: Partial<Omit<GalleryItem, 'id' | 'type' | 'src'>>,
): GalleryItem {
  return {
    id: crypto.randomUUID(),
    type,
    src,
    srcMd: extra?.srcMd,
    srcSm: extra?.srcSm,
    alt: extra?.alt ?? '',
    caption: extra?.caption ?? '',
    poster: extra?.poster,
  }
}

export function parseGalleryItems(raw: unknown): GalleryItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((entry) => {
      const item = entry as GalleryItem
      if (!item?.src || (item.type !== 'image' && item.type !== 'video')) return null
      return {
        id: item.id || crypto.randomUUID(),
        type: item.type,
        src: item.src,
        srcMd: item.srcMd,
        srcSm: item.srcSm,
        alt: item.alt ?? '',
        caption: item.caption ?? '',
        poster: item.poster,
      } satisfies GalleryItem
    })
    .filter(Boolean) as GalleryItem[]
}
