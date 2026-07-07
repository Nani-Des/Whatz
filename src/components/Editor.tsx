import { useEffect, useMemo, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Toolbar from './Toolbar'
import { createEditorExtensions } from '../lib/tiptapExtensions'
import { DEFAULT_FONT_SIZE } from '../lib/fontSizeExtension'
import type { PostReference } from '../types/post'
import { createCitationNumberResolver } from '../utils/citations'
import { deferEditorTask } from '../utils/deferEditorTask'

interface EditorProps {
  content: string
  onChange: (html: string) => void
  postId?: string | null
  references?: PostReference[]
  onSave?: () => void
  onImageUpload?: (file: File) => Promise<string>
  onVideoUpload?: (file: File) => Promise<string>
}

export default function Editor({
  content,
  onChange,
  postId,
  references = [],
  onSave,
  onImageUpload,
  onVideoUpload,
}: EditorProps) {
  const isInternalUpdate = useRef(false)
  const onSaveRef = useRef(onSave)
  const onImageUploadRef = useRef(onImageUpload)
  const onVideoUploadRef = useRef(onVideoUpload)
  const referencesRef = useRef(references)
  const getCitationNumberRef = useRef<(refId: string) => number | null>(() => null)
  onSaveRef.current = onSave
  onImageUploadRef.current = onImageUpload
  onVideoUploadRef.current = onVideoUpload
  referencesRef.current = references
  getCitationNumberRef.current = createCitationNumberResolver(references)

  const extensions = useMemo(
    () => createEditorExtensions((refId) => getCitationNumberRef.current(refId)),
    [],
  )

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor: ed }) => {
      isInternalUpdate.current = true
      onChange(ed.getHTML())
    },
    onCreate: ({ editor: ed }) => {
      deferEditorTask(() => {
        if (ed.isDestroyed || !ed.isEmpty) return
        ed.commands.setFontSize(DEFAULT_FONT_SIZE)
      })
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
    getCitationNumberRef.current = createCitationNumberResolver(referencesRef.current)
    const citation = editor.extensionManager.extensions.find((e) => e.name === 'citation')
    if (citation) {
      citation.options.getCitationNumber = (refId: string) => getCitationNumberRef.current(refId)
    }
    deferEditorTask(() => {
      if (editor.isDestroyed) return
      editor.view.dispatch(editor.state.tr)
    })
  }, [references, editor])

  useEffect(() => {
    if (!editor || isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    if (editor.getHTML() === content) return

    deferEditorTask(() => {
      if (editor.isDestroyed || editor.getHTML() === content) return
      isInternalUpdate.current = true
      editor.commands.setContent(content, { emitUpdate: false })
    })
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
    const handleInsertVideo = () => {
      window.dispatchEvent(new CustomEvent('editor:open-video-picker'))
    }
    const handleInsertPostLink = (e: Event) => {
      const detail = (e as CustomEvent<{ postId: string; slug: string; title: string }>).detail
      if (!detail?.postId || !editor) return
      editor.chain().focus().setPostLink(detail).run()
    }
    const handlePickPostLink = () => {
      window.dispatchEvent(new CustomEvent('editor:open-post-picker', { detail: { mode: 'inline' } }))
    }
    window.addEventListener('editor:insert-image', handleInsertImage)
    window.addEventListener('editor:insert-video', handleInsertVideo)
    window.addEventListener('editor:insert-post-link', handleInsertPostLink)
    window.addEventListener('editor:pick-post-link', handlePickPostLink)
    window.addEventListener('editor:insert-citation', handleInsertCitation)
    return () => {
      window.removeEventListener('editor:insert-image', handleInsertImage)
      window.removeEventListener('editor:insert-video', handleInsertVideo)
      window.removeEventListener('editor:insert-post-link', handleInsertPostLink)
      window.removeEventListener('editor:pick-post-link', handlePickPostLink)
      window.removeEventListener('editor:insert-citation', handleInsertCitation)
    }
  }, [editor])

  const charCount = editor?.storage.characterCount?.characters() ?? 0
  const wordCount = editor?.storage.characterCount?.words() ?? 0

  return (
    <div className="editor-surface overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <Toolbar editor={editor} postId={postId} references={references} onImageUpload={onImageUpload} onVideoUpload={onVideoUpload} />
      <div className="tiptap-editor-content min-h-[360px] bg-white sm:min-h-[480px]">
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
        <span className="hidden sm:inline">{wordCount} words · Ctrl+S save · Ctrl+K link · / commands</span>
        <span className="sm:hidden">{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  )
}
