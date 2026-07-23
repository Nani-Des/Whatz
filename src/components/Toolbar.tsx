import { useEffect, useRef, useState } from 'react'
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
import { insertCollapsibleWithPrompt } from '../lib/collapsibleExtension'
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

import TableToolbar from './TableToolbar'
import type { PostReference } from '../types/post'
import { isUploadedImageUrls, isUploadedVideoUrls } from '../types/media'
import { formatCitationLabel } from '../utils/citations'
import { deferEditorTask } from '../utils/deferEditorTask'

interface ToolbarProps {
  editor: Editor | null
  postId?: string | null
  references?: PostReference[]
  onImageUpload?: (file: File) => Promise<string | import('../types/media').UploadedImageUrls>
  onVideoUpload?: (file: File) => Promise<string | import('../types/media').UploadedVideoUrls>
}

export default function Toolbar({ editor, onImageUpload, onVideoUpload, references = [] }: ToolbarProps) {
  const [, tick] = useState(0)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const onImageUploadRef = useRef(onImageUpload)
  const onVideoUploadRef = useRef(onVideoUpload)
  onImageUploadRef.current = onImageUpload
  onVideoUploadRef.current = onVideoUpload

  useEffect(() => {
    if (!editor) return
    const refresh = () => deferEditorTask(() => tick((n) => n + 1))
    editor.on('selectionUpdate', refresh)
    editor.on('transaction', refresh)
    return () => {
      editor.off('selectionUpdate', refresh)
      editor.off('transaction', refresh)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

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

    const openImagePicker = () => imageInputRef.current?.click()
    const openVideoPicker = () => videoInputRef.current?.click()

    window.addEventListener('editor:set-link', setLink)
    window.addEventListener('editor:open-image-picker', openImagePicker)
    window.addEventListener('editor:open-video-picker', openVideoPicker)
    return () => {
      window.removeEventListener('editor:set-link', setLink)
      window.removeEventListener('editor:open-image-picker', openImagePicker)
      window.removeEventListener('editor:open-video-picker', openVideoPicker)
    }
  }, [editor])

  if (!editor) return null

  const fontSize = getCurrentFontSize(editor)
  const fontSizeLabel = fontSize.replace('px', '')
  const fontFamily = getCurrentFontFamily(editor)
  const blockType = getBlockType(editor)
  const inTable = editor.isActive('table')
  const imageActive = editor.isActive('image')
  const imageAttrs = editor.getAttributes('image') as { width?: string | null; height?: string | null }

  const setImageSize = (width?: string | number | null, height?: string | number | null) => {
    editor.chain().focus().updateAttributes('image', {
      width: width ?? null,
      height: height ?? null,
    }).run()
  }

  const setBlockType = (value: string) => {
    if (value === 'paragraph') editor.chain().focus().setParagraph().run()
    else if (value === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run()
    else if (value === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run()
    else if (value === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run()
  }

  const setLink = () => window.dispatchEvent(new CustomEvent('editor:set-link'))

  const handleImageFile = async (file: File) => {
    if (onImageUploadRef.current) {
      try {
        const result = await onImageUploadRef.current(file)
        if (isUploadedImageUrls(result)) {
          editor.chain().focus().insertContent({
            type: 'image',
            attrs: { src: result.full, srcMd: result.medium, srcSm: result.small },
          }).run()
        } else {
          editor.chain().focus().setImage({ src: result }).run()
        }
      } catch {
        alert('Image upload failed. Save the post first or check Firebase Storage.')
      }
    } else {
      const url = window.prompt('Enter image URL')
      if (url) editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const handleVideoFile = async (file: File) => {
    if (onVideoUploadRef.current) {
      try {
        const result = await onVideoUploadRef.current(file)
        if (isUploadedVideoUrls(result)) {
          editor.chain().focus().setVideo({ src: result.url, poster: result.poster, title: file.name }).run()
        } else {
          editor.chain().focus().setVideo({ src: result, title: file.name }).run()
        }
      } catch {
        alert('Video upload failed. Save the post first or check Firebase Storage.')
      }
    } else {
      const url = window.prompt('Enter video URL')
      if (url) editor.chain().focus().setVideo({ src: url }).run()
    }
  }

  const insertCollapsible = () => {
    if (editor) insertCollapsibleWithPrompt(editor)
  }

  const insertCallout = (variant: 'note' | 'warning' | 'tip') => {
    editor.chain().focus().insertContent({
      type: 'callout',
      attrs: { variant },
      content: [{ type: 'paragraph' }],
    }).run()
  }

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageFile(file)
          e.target.value = ''
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleVideoFile(file)
          e.target.value = ''
        }}
      />
      <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-2 scrollbar-thin">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
          <IconUndo />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <IconRedo />
        </ToolbarButton>

        <Divider />

        <select
          value={blockType}
          onChange={(e) => setBlockType(e.target.value)}
          title="Text style"
          className="h-8 max-w-[7.5rem] shrink-0 rounded-md border-0 bg-transparent px-2 text-sm text-neutral-700 hover:bg-neutral-100 focus:outline-none cursor-pointer"
        >
          <option value="paragraph">Normal text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select
          value={fontFamily}
          onChange={(e) => {
            if (e.target.value) editor.chain().focus().setFontFamily(e.target.value).run()
            else editor.chain().focus().unsetFontFamily().run()
          }}
          title="Font"
          className="h-8 max-w-[9rem] shrink-0 rounded-md border border-neutral-200 bg-white px-2 text-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none cursor-pointer"
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
          <ToolbarButton onClick={() => editor.chain().focus().setFontSize(stepFontSize(fontSize, 'down')).run()} title="Decrease font size">
            <IconMinus />
          </ToolbarButton>
          <select
            value={fontSize}
            onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
            title="Font size"
            className="h-8 w-12 border-0 bg-transparent text-center text-sm text-gray-700 focus:outline-none cursor-pointer"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>{size.replace('px', '')}</option>
            ))}
          </select>
          <ToolbarButton onClick={() => editor.chain().focus().setFontSize(stepFontSize(fontSize, 'up')).run()} title="Increase font size">
            <IconPlus />
          </ToolbarButton>
        </div>

        <span className="hidden sm:inline text-xs text-gray-400 px-1">{fontSizeLabel}</span>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <IconBold />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <IconItalic />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <IconUnderline />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <IconStrike />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
          <span className="text-[11px] font-semibold">x<sub className="text-[8px]">2</sub></span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
          <span className="text-[11px] font-semibold">x<sup className="text-[8px]">2</sup></span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
          <IconHighlight />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
          <IconAlignLeft />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
          <IconAlignCenter />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
          <IconAlignRight />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <IconAlignJustify />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <IconBulletList />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <IconOrderedList />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
          <IconQuote />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          <IconCode />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          <IconCodeBlock />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => window.dispatchEvent(new CustomEvent('editor:open-equation', { detail: { display: false } }))}
          title="Insert equation (LaTeX)"
        >
          <span className="text-sm font-serif italic">∑</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <IconHr />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Link (Ctrl+K)">
          <IconLink />
        </ToolbarButton>
        {references.length > 0 && (
          <select
            defaultValue=""
            onChange={(e) => {
              const refId = e.target.value
              if (refId) {
                editor.chain().focus().insertCitation(refId).run()
                e.target.value = ''
              }
            }}
            title="Insert citation"
            className="h-8 max-w-[6.5rem] shrink-0 rounded-md border border-neutral-200 bg-white px-2 text-xs text-neutral-700 hover:bg-neutral-50 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>Cite…</option>
            {references.map((ref, i) => (
              <option key={ref.id} value={ref.id}>
                {formatCitationLabel(i + 1)} {ref.title.slice(0, 28)}
              </option>
            ))}
          </select>
        )}
        <ToolbarButton onClick={() => imageInputRef.current?.click()} title="Upload image">
          <IconImage />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTextSticker().run()}
          active={editor.isActive('textSticker')}
          title="Text sticker"
        >
          <span className="text-xs font-bold tracking-tight">◆</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => window.dispatchEvent(new CustomEvent('editor:insert-gallery'))}
          active={editor.isActive('gallery')}
          title="Insert photo gallery"
        >
          <span className="text-[11px] font-semibold">▦</span>
        </ToolbarButton>

        {imageActive && (
          <>
            <Divider />
            <div className="flex shrink-0 flex-wrap items-center gap-1 rounded-md border border-neutral-200 bg-white px-1 py-0.5">
              <span className="px-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">Image</span>
              {(['25%', '50%', '75%', '100%'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setImageSize(size, null)}
                  className="rounded px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                >
                  {size}
                </button>
              ))}
              <input
                type="number"
                min={80}
                placeholder="W px"
                value={imageAttrs.width && !String(imageAttrs.width).includes('%') ? parseInt(String(imageAttrs.width), 10) || '' : ''}
                onChange={(e) => setImageSize(e.target.value ? Number(e.target.value) : null, imageAttrs.height ?? null)}
                className="w-16 rounded border border-neutral-200 px-1.5 py-1 text-xs"
              />
              <input
                type="number"
                min={60}
                placeholder="H px"
                value={imageAttrs.height ? parseInt(String(imageAttrs.height), 10) || '' : ''}
                onChange={(e) => setImageSize(imageAttrs.width ?? null, e.target.value ? Number(e.target.value) : null)}
                className="w-16 rounded border border-neutral-200 px-1.5 py-1 text-xs"
              />
              <button
                type="button"
                onClick={() => setImageSize(null, null)}
                className="rounded px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
              >
                Reset
              </button>
            </div>
          </>
        )}

        <ToolbarButton onClick={() => videoInputRef.current?.click()} title="Upload video">
          <span className="text-[11px] font-semibold">▶</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => window.dispatchEvent(new CustomEvent('editor:pick-post-link'))}
          title="Link to another post"
        >
          <span className="text-[11px] font-semibold">📄</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => window.dispatchEvent(new CustomEvent('editor:open-table-insert'))}
          active={inTable}
          title="Insert table"
        >
          <IconTable />
        </ToolbarButton>

        <Divider />

        <button type="button" onClick={insertCollapsible} title="Collapsible section — click title to edit" className="rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100">
          ▸ Section
        </button>
        <button type="button" onClick={() => insertCallout('note')} title="Note callout" className="rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100">
          Note
        </button>
        <button type="button" onClick={() => insertCallout('warning')} title="Warning callout" className="rounded-md px-2 py-1 text-xs text-amber-700 hover:bg-amber-50">
          Warn
        </button>
        <button type="button" onClick={() => insertCallout('tip')} title="Tip callout" className="rounded-md px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50">
          Tip
        </button>

        {inTable && (
          <>
            <Divider />
            <TableToolbar editor={editor} />
          </>
        )}
      </div>
    </>
  )
}
