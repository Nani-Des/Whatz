import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import MathNodeView from '../components/MathNodeView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathInline: {
      insertMathInline: (options: { latex: string }) => ReturnType
    }
    mathBlock: {
      insertMathBlock: (options: { latex: string }) => ReturnType
    }
  }
}

function createMathNode(name: 'mathInline' | 'mathBlock', display: boolean) {
  return Node.create({
    name,
    group: display ? 'block' : 'inline',
    inline: !display,
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
      return {
        latex: {
          default: '',
          parseHTML: (el) => (el as HTMLElement).getAttribute('data-latex') ?? '',
          renderHTML: (attributes) =>
            attributes.latex ? { 'data-latex': attributes.latex as string } : {},
        },
        display: {
          default: display,
          parseHTML: (el) => (el as HTMLElement).getAttribute('data-display') === 'true',
          renderHTML: (attributes) => ({
            'data-display': attributes.display ? 'true' : 'false',
          }),
        },
      }
    },

    parseHTML() {
      return [
        {
          tag: display ? 'div[data-type="math"]' : 'span[data-type="math"]',
          getAttrs: (el) => {
            const node = el as HTMLElement
            const isDisplay = node.getAttribute('data-display') === 'true'
            if (isDisplay !== display) return false
            return { latex: node.getAttribute('data-latex') ?? '' }
          },
        },
      ]
    },

    renderHTML({ node, HTMLAttributes }) {
      const tag = display ? 'div' : 'span'
      return [
        tag,
        mergeAttributes(HTMLAttributes, {
          'data-type': 'math',
          'data-latex': node.attrs.latex,
          'data-display': display ? 'true' : 'false',
          class: display ? 'math-block' : 'math-inline',
        }),
      ]
    },

    addNodeView() {
      return ReactNodeViewRenderer(MathNodeView)
    },

    addCommands() {
      return display
        ? {
            insertMathBlock:
              (options: { latex: string }) =>
              ({ commands }) =>
                commands.insertContent({
                  type: name,
                  attrs: { latex: options.latex, display },
                }),
          }
        : {
            insertMathInline:
              (options: { latex: string }) =>
              ({ commands }) =>
                commands.insertContent({
                  type: name,
                  attrs: { latex: options.latex, display },
                }),
          }
    },
  })
}

export const MathInline = createMathNode('mathInline', false)
export const MathBlock = createMathNode('mathBlock', true)
