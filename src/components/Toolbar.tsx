import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  FONT_SIZES,
  getCurrentFontSize,
  stepFontSize,
} from '../lib/fontSizeExtension'
import {
  FONT_FAMILIES,
  getCurrentFontFamily,
} from '../lib/fontFamilyExtension'
import {
  IconAlignCenter,
  IconAlignJustify,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconBulletList,
  IconCode,
  IconCodeBlock,
  IconHighlight,
  IconHr,
  IconImage,
  IconItalic,
  IconLink,
  IconMinus,
  IconOrderedList,
  IconPlus,
  IconQuote,
  IconRedo,
  IconStrike,
  IconTable,
  IconUnderline,
  IconUndo,
} from './ToolbarIcons'

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        active
          ? 'bg-neutral-800 text-white'
          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
      } ${disabled ? 'opacity-35 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="mx-1 h-6 w-px shrink-0 bg-gray-200" />
}

function getBlockType(editor: Editor): string {
  if (editor.isActive('heading', { level: 1 })) return 'h1'
  if (editor.isActive('heading', { level: 2 })) return 'h2'
  if (editor.isActive('heading', { level: 3 })) return 'h3'
  return 'paragraph'
}

interface ToolbarProps {
  editor: Editor | null
}

export default function Toolbar({ editor }: ToolbarProps) {
  const [, tick] = useState(0)

  useEffect(() => {
    if (!editor) return
    const refresh = () => tick((n) => n + 1)
    editor.on('selectionUpdate', refresh)
    editor.on('transaction', refresh)
    return () => {
      editor.off('selectionUpdate', refresh)
      editor.off('transaction', refresh)
    }
  }, [editor])

  if (!editor) return null

  const fontSize = getCurrentFontSize(editor)
  const fontSizeLabel = fontSize.replace('px', '')
  const fontFamily = getCurrentFontFamily(editor)
  const blockType = getBlockType(editor)
  const inTable = editor.isActive('table')

  const setBlockType = (value: string) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run()
    } else if (value === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run()
    } else if (value === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run()
    } else if (value === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const changeFontSize = (size: string) => {
    editor.chain().focus().setFontSize(size).run()
  }

  const adjustFontSize = (direction: 'up' | 'down') => {
    changeFontSize(stepFontSize(fontSize, direction))
  }

  const changeFontFamily = (value: string) => {
    if (value) {
      editor.chain().focus().setFontFamily(value).run()
    } else {
      editor.chain().focus().unsetFontFamily().run()
    }
  }

  return (
    <div className="sticky top-0 z-20 border-b border-neutral-200 bg-neutral-50">
      <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-2 scrollbar-thin">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <IconUndo />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <IconRedo />
        </ToolbarButton>

        <Divider />

        <select
          value={blockType}
          onChange={(e) => setBlockType(e.target.value)}
          title="Text style"
          className="h-8 max-w-[7.5rem] shrink-0 rounded-md border-0 bg-transparent px-2 text-sm text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400/40 cursor-pointer"
        >
          <option value="paragraph">Normal text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select
          value={fontFamily}
          onChange={(e) => changeFontFamily(e.target.value)}
          title="Font"
          className="h-8 max-w-[9rem] shrink-0 rounded-md border border-neutral-200 bg-white px-2 text-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400/40 cursor-pointer"
          style={{ fontFamily: fontFamily || undefined }}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.label} value={font.value} style={{ fontFamily: font.value || undefined }}>
              {font.label}
            </option>
          ))}
        </select>

        <Divider />

        <div className="flex shrink-0 items-center rounded-md border border-gray-200 bg-white">
          <ToolbarButton onClick={() => adjustFontSize('down')} title="Decrease font size">
            <IconMinus />
          </ToolbarButton>
          <select
            value={fontSize}
            onChange={(e) => changeFontSize(e.target.value)}
            title="Font size"
            className="h-8 w-12 border-0 bg-transparent text-center text-sm text-gray-700 focus:outline-none cursor-pointer"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>{size.replace('px', '')}</option>
            ))}
          </select>
          <ToolbarButton onClick={() => adjustFontSize('up')} title="Increase font size">
            <IconPlus />
          </ToolbarButton>
        </div>

        <span className="hidden sm:inline text-xs text-gray-400 px-1">{fontSizeLabel}</span>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <IconBold />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <IconItalic />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <IconUnderline />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <IconStrike />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          title="Highlight"
        >
          <IconHighlight />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align left"
        >
          <IconAlignLeft />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align center"
        >
          <IconAlignCenter />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align right"
        >
          <IconAlignRight />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <IconAlignJustify />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <IconBulletList />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <IconOrderedList />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <IconQuote />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline code"
        >
          <IconCode />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code block"
        >
          <IconCodeBlock />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <IconHr />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Insert link">
          <IconLink />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Insert image">
          <IconImage />
        </ToolbarButton>
        <ToolbarButton onClick={insertTable} active={inTable} title="Insert table">
          <IconTable />
        </ToolbarButton>

        {inTable && (
          <>
            <Divider />
            <div className="flex shrink-0 flex-wrap items-center gap-1 rounded-md border border-gray-200 bg-white px-1 py-0.5">
              <span className="px-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">Table</span>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                title="Add row above"
              >
                + Row ↑
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                title="Add row below"
              >
                + Row ↓
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                title="Delete current row"
              >
                − Row
              </button>
              <span className="mx-0.5 h-4 w-px bg-gray-200" />
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                title="Add column left"
              >
                + Col ←
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                title="Add column right"
              >
                + Col →
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                title="Delete current column"
              >
                − Col
              </button>
              <span className="mx-0.5 h-4 w-px bg-gray-200" />
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                title="Toggle header row"
              >
                Header row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                title="Delete entire table"
              >
                Delete table
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
