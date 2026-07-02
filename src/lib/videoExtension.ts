import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import VideoEditorView from '../components/VideoEditorView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; poster?: string; title?: string }) => ReturnType
    }
  }
}

export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute('data-src')
          || (el as HTMLElement).querySelector('video')?.getAttribute('src')
          || null,
      },
      poster: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-poster') || null,
      },
      title: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-title') || null,
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'figure[data-type="video"]' },
      { tag: 'video[src]' },
    ]
  },

  renderHTML({ node }) {
    const attrs: Record<string, string> = {
      'data-type': 'video',
      'data-src': node.attrs.src,
      class: 'post-video-embed',
    }
    if (node.attrs.poster) attrs['data-poster'] = node.attrs.poster
    if (node.attrs.title) attrs['data-title'] = node.attrs.title

    return [
      'figure',
      attrs,
      ['div', { class: 'post-video-skeleton', 'aria-hidden': 'true' }, 'Video'],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEditorView)
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    }
  },
})
