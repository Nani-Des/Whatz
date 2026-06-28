import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collapsible: {
      setCollapsible: (title?: string) => ReturnType
      toggleCollapsible: () => ReturnType
    }
  }
}

export const Collapsible = Node.create({
  name: 'collapsible',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      title: {
        default: 'Click to expand',
        parseHTML: (el) => {
          const summary = (el as HTMLElement).querySelector('summary')
          return summary?.textContent || 'Click to expand'
        },
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'details[data-type="collapsible"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'details',
      mergeAttributes(HTMLAttributes, { 'data-type': 'collapsible', class: 'collapsible-block' }),
      ['summary', {}, node.attrs.title],
      ['div', { class: 'collapsible-content' }, 0],
    ]
  },

  addCommands() {
    return {
      setCollapsible:
        (title = 'Click to expand') =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { title },
            content: [{ type: 'paragraph' }],
          }),
      toggleCollapsible:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
    }
  },
})
