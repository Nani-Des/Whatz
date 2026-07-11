import { Extension } from '@tiptap/core'
import Suggestion, { type SuggestionProps } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import SlashCommandList, { type SlashCommandItem } from '../components/SlashCommandList'

export const SLASH_COMMANDS: SlashCommandItem[] = [
  { title: 'Heading 1', description: 'Large section heading', icon: 'H1', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run() },
  { title: 'Heading 2', description: 'Medium section heading', icon: 'H2', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run() },
  { title: 'Heading 3', description: 'Small section heading', icon: 'H3', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run() },
  { title: 'Collapsible', description: 'Expandable section with editable title', icon: '▸', command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).run()
    const title = window.prompt('Section title (shown in the header)', 'Section title')
    if (title !== null) editor.chain().focus().setCollapsible(title.trim() || 'Section title').run()
  } },
  { title: 'Table', description: 'Insert a table with custom rows and columns', icon: '⊞', command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).run()
    window.dispatchEvent(new CustomEvent('editor:open-table-insert'))
  } },
  { title: 'Image', description: 'Upload or link an image', icon: '🖼', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); window.dispatchEvent(new CustomEvent('editor:insert-image')) } },
  { title: 'Video', description: 'Upload or embed a video', icon: '🎬', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); window.dispatchEvent(new CustomEvent('editor:insert-video')) } },
  { title: 'Post link', description: 'Link to another portfolio post', icon: '📄', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); window.dispatchEvent(new CustomEvent('editor:pick-post-link')) } },
  { title: 'Divider', description: 'Horizontal rule', icon: '—', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
  { title: 'Note callout', description: 'Informational callout', icon: 'ℹ', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertContent({ type: 'callout', attrs: { variant: 'note' }, content: [{ type: 'paragraph' }] }).run() },
  { title: 'Warning callout', description: 'Warning callout', icon: '⚠', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertContent({ type: 'callout', attrs: { variant: 'warning' }, content: [{ type: 'paragraph' }] }).run() },
  { title: 'Tip callout', description: 'Helpful tip callout', icon: '💡', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertContent({ type: 'callout', attrs: { variant: 'tip' }, content: [{ type: 'paragraph' }] }).run() },
  { title: 'Code block', description: 'Syntax-highlighted code', icon: '{ }', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run() },
  { title: 'Inline equation', description: 'LaTeX math in line', icon: '∑', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); window.dispatchEvent(new CustomEvent('editor:open-equation', { detail: { display: false } })) } },
  { title: 'Display equation', description: 'Centered LaTeX block', icon: '∫', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); window.dispatchEvent(new CustomEvent('editor:open-equation', { detail: { display: true } })) } },
  { title: 'Bullet list', description: 'Unordered list', icon: '•', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
  { title: 'Quote', description: 'Block quote', icon: '"', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
]

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: SuggestionProps['editor']; range: SuggestionProps['range']; props: SlashCommandItem }) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) =>
          SLASH_COMMANDS.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()),
          ).slice(0, 12),
        render: () => {
          let component: ReactRenderer | null = null
          let popup: TippyInstance[] | null = null

          return {
            onStart: (props: SuggestionProps<SlashCommandItem>) => {
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              })
              if (!props.clientRect) return
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })
            },
            onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
              component?.updateProps(props)
              if (!props.clientRect) return
              popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect })
            },
            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (props.event.key === 'Escape') {
                popup?.[0]?.hide()
                return true
              }
              return (component?.ref as { onKeyDown?: (e: KeyboardEvent) => boolean })?.onKeyDown?.(props.event) ?? false
            },
            onExit: () => {
              popup?.[0]?.destroy()
              component?.destroy()
            },
          }
        },
      }),
    ]
  },
})
