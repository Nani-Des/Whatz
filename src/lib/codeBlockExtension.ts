import CodeBlock from '@tiptap/extension-code-block'
import { mergeAttributes } from '@tiptap/core'

export const CodeBlockWithLanguage = CodeBlock.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: 'plaintext',
        parseHTML: (el) => {
          const code = (el as HTMLElement).querySelector('code')
          const cls = code?.className || ''
          const match = cls.match(/language-(\w+)/)
          return match ? match[1] : 'plaintext'
        },
        renderHTML: (attrs) => ({
          class: attrs.language ? `language-${attrs.language}` : null,
        }),
      },
    }
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ['code', { class: node.attrs.language ? `language-${node.attrs.language}` : undefined }, 0],
    ]
  },
})
