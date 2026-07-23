import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import TextStickerEditorView from '../components/TextStickerEditorView'
import {
  DEFAULT_STICKER_ALIGN,
  DEFAULT_STICKER_COLOR,
  DEFAULT_STICKER_SHAPE,
  DEFAULT_STICKER_TEXT,
  type TextStickerAlign,
  type TextStickerColor,
  type TextStickerShape,
} from '../types/textSticker'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textSticker: {
      insertTextSticker: (options?: {
        text?: string
        shape?: TextStickerShape
        color?: TextStickerColor
        align?: TextStickerAlign
      }) => ReturnType
    }
  }
}

export const TextSticker = Node.create({
  name: 'textSticker',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      text: {
        default: DEFAULT_STICKER_TEXT,
        parseHTML: (el) => (el as HTMLElement).querySelector('.text-sticker__text')?.textContent?.trim()
          || (el as HTMLElement).getAttribute('data-text')
          || DEFAULT_STICKER_TEXT,
        renderHTML: (attrs) => ({ 'data-text': attrs.text || DEFAULT_STICKER_TEXT }),
      },
      shape: {
        default: DEFAULT_STICKER_SHAPE,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-shape') || DEFAULT_STICKER_SHAPE,
        renderHTML: (attrs) => ({ 'data-shape': attrs.shape || DEFAULT_STICKER_SHAPE }),
      },
      color: {
        default: DEFAULT_STICKER_COLOR,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-color') || DEFAULT_STICKER_COLOR,
        renderHTML: (attrs) => ({ 'data-color': attrs.color || DEFAULT_STICKER_COLOR }),
      },
      align: {
        default: DEFAULT_STICKER_ALIGN,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-align') || DEFAULT_STICKER_ALIGN,
        renderHTML: (attrs) => ({ 'data-align': attrs.align || DEFAULT_STICKER_ALIGN }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="text-sticker"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const shape = node.attrs.shape || DEFAULT_STICKER_SHAPE
    const color = node.attrs.color || DEFAULT_STICKER_COLOR
    const align = node.attrs.align || DEFAULT_STICKER_ALIGN
    const text = (node.attrs.text || DEFAULT_STICKER_TEXT).trim() || DEFAULT_STICKER_TEXT

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'text-sticker',
        class: `text-sticker text-sticker--${shape} text-sticker--${color} text-sticker--align-${align}`,
      }),
      ['span', { class: 'text-sticker__text' }, text],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TextStickerEditorView)
  },

  addCommands() {
    return {
      insertTextSticker:
        (options = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              text: options.text ?? DEFAULT_STICKER_TEXT,
              shape: options.shape ?? DEFAULT_STICKER_SHAPE,
              color: options.color ?? DEFAULT_STICKER_COLOR,
              align: options.align ?? DEFAULT_STICKER_ALIGN,
            },
          }),
    }
  },
})
