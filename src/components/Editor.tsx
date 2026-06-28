import { useEffect, useMemo, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Toolbar from './Toolbar'
import { createEditorExtensions } from '../lib/tiptapExtensions'
import type { PostReference } from '../types/post'
import { createCitationNumberResolver } from '../utils/citations'

interface EditorProps {
  content: string
  onChange: (html: string) => void
  postId?: string | null
  references?: PostReference[]
  onSave?: () => void
  onImageUpload?: (file: File) => Promise<string>
}

export default function Editor({
  content,
  onChange,
  postId,
  references = [],
  onSave,
  onImageUpload,
}: EditorProps) {
  const isInternalUpdate = useRef(false)
  const onSaveRef = useRef(onSave)
  const onImageUploadRef = useRef(onImageUpload)
  const referencesRef = useRef(references)
  onSaveRef.current = onSave
  onImageUploadRef.current = onImageUpload
  referencesRef.current = references

  const extensions = useMemo(
    () => createEditorExtensions(createCitationNumberResolver(references)),
    // Re-resolve citation numbers when reference list changes
    [references],
  )

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor: ed }) => {
      isInternalUpdate.current = true
      onChange(ed.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-body focus:outline-none',
      },
      handleKeyDown: (_view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault()
          onSaveRef.current?.()
          return true
        }
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault()
          window.dispatchEvent(new CustomEvent('editor:set-link'))
          return true
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const citation = editor.extensionManager.extensions.find((e) => e.name === 'citation')
    if (citation) {
      citation.options.getCitationNumber = createCitationNumberResolver(referencesRef.current)
      editor.view.dispatch(editor.state.tr)
    }
  }, [references, editor])

  useEffect(() => {
    if (!editor || isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useEffect(() => {
    const handleInsertImage = () => {
      window.dispatchEvent(new CustomEvent('editor:open-image-picker'))
    }
    const handleInsertCitation = (e: Event) => {
      const refId = (e as CustomEvent<{ refId: string }>).detail?.refId
      if (!refId || !editor) return
      editor.chain().focus().insertCitation(refId).run()
    }
    window.addEventListener('editor:insert-image', handleInsertImage)
    window.addEventListener('editor:insert-citation', handleInsertCitation)
    return () => {
      window.removeEventListener('editor:insert-image', handleInsertImage)
      window.removeEventListener('editor:insert-citation', handleInsertCitation)
    }
  }, [editor])

  const charCount = editor?.storage.characterCount?.characters() ?? 0
  const wordCount = editor?.storage.characterCount?.words() ?? 0

  return (
    <div className="editor-surface overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <Toolbar editor={editor} postId={postId} references={references} onImageUpload={onImageUpload} />
      <div className="tiptap-editor-content px-6 py-5 sm:px-12 sm:py-8 min-h-[480px] bg-white">
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
        <span>{wordCount} words · Ctrl+S save · Ctrl+K link · / commands · cite from references panel</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  )
}
