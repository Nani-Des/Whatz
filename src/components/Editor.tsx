import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Toolbar from './Toolbar'
import { editorExtensions } from '../lib/tiptapExtensions'

interface EditorProps {
  content: string
  onChange: (html: string) => void
}

export default function Editor({ content, onChange }: EditorProps) {
  const isInternalUpdate = useRef(false)

  const editor = useEditor({
    extensions: editorExtensions,
    content,
    onUpdate: ({ editor: ed }) => {
      isInternalUpdate.current = true
      onChange(ed.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-body focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (!editor || isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const charCount = editor?.storage.characterCount?.characters() ?? 0
  const wordCount = editor?.storage.characterCount?.words() ?? 0

  return (
    <div className="editor-surface overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <Toolbar editor={editor} />
      <div className="tiptap-editor-content px-6 py-5 sm:px-12 sm:py-8 min-h-[480px] bg-white">
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  )
}
