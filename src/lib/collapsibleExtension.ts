import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, type Editor } from '@tiptap/react'
import CollapsibleView from '../components/CollapsibleView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collapsible: {
      setCollapsible: (title?: string) => ReturnType
      updateCollapsibleTitle: (title: string) => ReturnType
    }
  }
}

export const Collapsible = Node.create({
  name: 'collapsible',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      title: {
        default: 'Section title',
        parseHTML: (el) => {
          const titleEl = (el as HTMLElement).querySelector('.collapsible-title')
          const summary = (el as HTMLElement).querySelector('summary')
          return titleEl?.textContent?.trim() || summary?.textContent?.trim() || 'Section title'
        },
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
      [
        'summary',
        { class: 'collapsible-summary' },
        ['span', { class: 'collapsible-chevron', 'aria-hidden': 'true' }, '▸'],
        ['span', { class: 'collapsible-title' }, node.attrs.title],
      ],
      ['div', { class: 'collapsible-content' }, 0],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CollapsibleView)
  },

  addCommands() {
    return {
      setCollapsible:
        (title = 'Section title') =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { title },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Section content…' }] }],
          }),
      updateCollapsibleTitle:
        (title: string) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { title }),
    }
  },
})

function promptSectionTitle(defaultTitle = 'Section title'): string | null {
  const title = window.prompt('Section title (shown in the collapsible header)', defaultTitle)
  if (title === null) return null
  return title.trim() || defaultTitle
}

export function insertCollapsibleWithPrompt(editor: Editor) {
  const title = promptSectionTitle()
  if (title === null) return
  editor.chain().focus().setCollapsible(title).run()
}
