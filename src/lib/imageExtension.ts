import Image from '@tiptap/extension-image'
import { mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ImageEditorView from '../components/ImageEditorView'

function formatDimension(value: string | number | null | undefined): string | null {
  if (value == null || value === '') return null
  const s = String(value).trim()
  if (!s) return null
  if (s.includes('%') || s.endsWith('px')) return s
  return `${s}px`
}

function buildImageStyle(width?: string | number | null, height?: string | number | null): string | undefined {
  const parts: string[] = []
  const w = formatDimension(width)
  const h = formatDimension(height)
  if (w) parts.push(`width: ${w}`)
  if (h) parts.push(`height: ${h}`)
  else if (w) parts.push('height: auto')
  return parts.length ? parts.join('; ') : undefined
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const el = element as HTMLElement
          return el.getAttribute('data-width') || el.getAttribute('width') || el.style.width || null
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const el = element as HTMLElement
          return el.getAttribute('data-height') || el.getAttribute('height') || el.style.height || null
        },
      },
      srcMd: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).getAttribute('data-src-md'),
        renderHTML: (attrs) => (attrs.srcMd ? { 'data-src-md': attrs.srcMd } : {}),
      },
      srcSm: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).getAttribute('data-src-sm'),
        renderHTML: (attrs) => (attrs.srcSm ? { 'data-src-sm': attrs.srcSm } : {}),
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const { width, height, ...rest } = HTMLAttributes
    const style = buildImageStyle(width as string, height as string)
    return [
      'img',
      mergeAttributes(rest, {
        ...(width ? { 'data-width': width } : {}),
        ...(height ? { 'data-height': height } : {}),
        ...(style ? { style } : {}),
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageEditorView)
  },
})

export { buildImageStyle, formatDimension }
