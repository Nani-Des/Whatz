import { Node, mergeAttributes } from '@tiptap/core'

export interface CitationOptions {
  getCitationNumber: (refId: string) => number | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    citation: {
      insertCitation: (refId: string) => ReturnType
    }
  }
}

export const Citation = Node.create<CitationOptions>({
  name: 'citation',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return {
      getCitationNumber: () => null,
    }
  },

  addAttributes() {
    return {
      refId: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-ref-id'),
        renderHTML: (attrs) => (attrs.refId ? { 'data-ref-id': attrs.refId } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'sup[data-type="citation"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const refId = node.attrs.refId as string
    const n = this.options.getCitationNumber(refId)
    const label = n ? `[${n}]` : '[?]'

    return [
      'sup',
      mergeAttributes(HTMLAttributes, { 'data-type': 'citation', class: 'citation', contenteditable: 'false' }),
      [
        'a',
        {
          href: `#ref-${refId}`,
          class: 'citation-link',
          'data-ref-id': refId,
        },
        label,
      ],
    ]
  },

  addCommands() {
    return {
      insertCitation:
        (refId: string) =>
        ({ commands }) => {
          if (!this.options.getCitationNumber(refId)) return false
          return commands.insertContent({ type: this.name, attrs: { refId } })
        },
    }
  },
})
