import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import GalleryEditorView from '../components/GalleryEditorView'
import {
  type GalleryColumns,
  type GalleryItem,
  type GalleryLayout,
  parseGalleryItems,
} from '../types/gallery'

export interface GalleryOptions {
  uploadImage: (file: File) => Promise<string>
  uploadVideo: (file: File) => Promise<string>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gallery: {
      insertGallery: (options?: {
        items?: GalleryItem[]
        columns?: GalleryColumns
        layout?: GalleryLayout
      }) => ReturnType
    }
  }
}

function renderGalleryItem(item: GalleryItem) {
  if (item.type === 'video') {
    const attrs: Record<string, string> = {
      class: 'post-gallery__item post-gallery__item--video',
      'data-src': item.src,
    }
    if (item.poster) attrs['data-poster'] = item.poster
    if (item.caption) attrs['data-caption'] = item.caption
    return ['div', attrs, ['div', { class: 'post-gallery__video-ph', 'aria-hidden': 'true' }, '▶']]
  }

  const children: unknown[] = [
    ['img', { src: item.src, alt: item.alt || '', loading: 'lazy', decoding: 'async' }],
  ]
  if (item.caption) {
    children.push(['figcaption', { class: 'post-gallery__caption' }, item.caption])
  }
  return ['figure', { class: 'post-gallery__item post-gallery__item--image' }, ...children]
}

export const Gallery = Node.create<GalleryOptions>({
  name: 'gallery',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      uploadImage: async () => {
        throw new Error('Image upload is not configured.')
      },
      uploadVideo: async () => {
        throw new Error('Video upload is not configured.')
      },
    }
  },

  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: (el) => {
          const node = el as HTMLElement
          const raw = node.getAttribute('data-items')
          if (raw) {
            try {
              return parseGalleryItems(JSON.parse(raw))
            } catch {
              return []
            }
          }
          return []
        },
        renderHTML: (attrs) =>
          attrs.items?.length ? { 'data-items': JSON.stringify(attrs.items) } : {},
      },
      layout: {
        default: 'grid' as GalleryLayout,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-layout') || 'grid',
        renderHTML: (attrs) => ({ 'data-layout': attrs.layout || 'grid' }),
      },
      columns: {
        default: 3,
        parseHTML: (el) => {
          const value = Number((el as HTMLElement).getAttribute('data-columns'))
          return value === 2 || value === 4 ? value : 3
        },
        renderHTML: (attrs) => ({ 'data-columns': String(attrs.columns || 3) }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'figure[data-type="gallery"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const items = parseGalleryItems(node.attrs.items)
    const columns = (node.attrs.columns === 2 || node.attrs.columns === 4 ? node.attrs.columns : 3) as GalleryColumns

    return [
      'figure',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'gallery',
        class: `post-gallery post-gallery--cols-${columns}`,
      }),
      [
        'div',
        { class: 'post-gallery__grid' },
        ...items.map((item) => renderGalleryItem(item)),
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryEditorView)
  },

  addCommands() {
    return {
      insertGallery:
        (options = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              items: options.items ?? [],
              layout: options.layout ?? 'grid',
              columns: options.columns ?? 3,
            },
          }),
    }
  },
})
