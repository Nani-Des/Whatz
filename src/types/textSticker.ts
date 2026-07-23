export type TextStickerShape = 'pill' | 'tag' | 'burst' | 'note' | 'label'
export type TextStickerColor = 'yellow' | 'coral' | 'mint' | 'sky' | 'lavender' | 'dark'
export type TextStickerAlign = 'left' | 'center' | 'right'

export const TEXT_STICKER_SHAPES: TextStickerShape[] = ['pill', 'tag', 'burst', 'note', 'label']
export const TEXT_STICKER_COLORS: TextStickerColor[] = ['yellow', 'coral', 'mint', 'sky', 'lavender', 'dark']

export const DEFAULT_STICKER_TEXT = 'Your idea'
export const DEFAULT_STICKER_SHAPE: TextStickerShape = 'pill'
export const DEFAULT_STICKER_COLOR: TextStickerColor = 'yellow'
export const DEFAULT_STICKER_ALIGN: TextStickerAlign = 'left'

export function parseTextStickerShape(value: unknown): TextStickerShape {
  if (typeof value === 'string' && TEXT_STICKER_SHAPES.includes(value as TextStickerShape)) {
    return value as TextStickerShape
  }
  return DEFAULT_STICKER_SHAPE
}

export function parseTextStickerColor(value: unknown): TextStickerColor {
  if (typeof value === 'string' && TEXT_STICKER_COLORS.includes(value as TextStickerColor)) {
    return value as TextStickerColor
  }
  return DEFAULT_STICKER_COLOR
}

export function parseTextStickerAlign(value: unknown): TextStickerAlign {
  if (value === 'center' || value === 'right') return value
  return 'left'
}
