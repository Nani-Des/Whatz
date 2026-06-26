import { Extension } from '@tiptap/core'

export const FONT_SIZES = [
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
] as const

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, '') || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

export function getCurrentFontSize(editor: { getAttributes: (name: string) => Record<string, unknown> }): string {
  const size = editor.getAttributes('textStyle').fontSize as string | undefined
  return size || '16px'
}

export function stepFontSize(current: string, direction: 'up' | 'down'): string {
  const idx = FONT_SIZES.indexOf(current as typeof FONT_SIZES[number])
  const baseIdx = idx >= 0 ? idx : FONT_SIZES.indexOf('16px')
  if (direction === 'up') {
    return FONT_SIZES[Math.min(baseIdx + 1, FONT_SIZES.length - 1)]
  }
  return FONT_SIZES[Math.max(baseIdx - 1, 0)]
}
