import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    postLink: {
      setPostLink: (options: { postId: string; slug: string; title: string; label?: string }) => ReturnType
    }
  }
}

export const PostLink = Node.create({
  name: 'postLink',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      postId: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-post-id'),
      },
      slug: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-slug'),
      },
      title: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-title'),
      },
      label: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-label'),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'a[data-type="post-link"]' }]
  },

  renderHTML({ node }) {
    const slug = node.attrs.slug as string
    const title = node.attrs.title as string
    const label = (node.attrs.label as string) || title

    return [
      'a',
      mergeAttributes({
        'data-type': 'post-link',
        'data-post-id': node.attrs.postId,
        'data-slug': slug,
        'data-title': title,
        'data-label': label,
        href: `/post/s/${slug}`,
        class: 'post-inline-link',
        contenteditable: 'false',
      }),
      label,
    ]
  },

  addCommands() {
    return {
      setPostLink:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              postId: options.postId,
              slug: options.slug,
              title: options.title,
              label: options.label ?? options.title,
            },
          }),
    }
  },
})
