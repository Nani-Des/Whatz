import { useRef, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import type { GalleryOptions } from '../lib/galleryExtension'
import {
  createGalleryItem,
  type GalleryColumns,
  type GalleryItem,
  parseGalleryItems,
} from '../types/gallery'

function getGalleryOptions(editor: NodeViewProps['editor']): GalleryOptions {
  const ext = editor.extensionManager.extensions.find((e) => e.name === 'gallery')
  return (ext?.options ?? {}) as GalleryOptions
}

export default function GalleryEditorView({ node, updateAttributes, selected, deleteNode, editor }: NodeViewProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const items = parseGalleryItems(node.attrs.items)
  const columns = (node.attrs.columns === 2 || node.attrs.columns === 4 ? node.attrs.columns : 3) as GalleryColumns

  const setItems = (next: GalleryItem[]) => updateAttributes({ items: next })
  const setColumns = (next: GalleryColumns) => updateAttributes({ columns: next })

  const uploadFiles = async (files: FileList | null, type: 'image' | 'video') => {
    if (!files?.length) return
    const options = getGalleryOptions(editor)
    const upload = type === 'image' ? options.uploadImage : options.uploadVideo
    setUploading(true)
    setError('')
    try {
      const added: GalleryItem[] = []
      for (const file of Array.from(files)) {
        const src = await upload(file)
        added.push(
          createGalleryItem(type, src, {
            alt: file.name,
            poster: type === 'video' ? undefined : undefined,
          }),
        )
      }
      setItems([...items, ...added])
    } catch {
      setError(type === 'image' ? 'Image upload failed.' : 'Video upload failed.')
    } finally {
      setUploading(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  const removeItem = (id: string) => setItems(items.filter((item) => item.id !== id))

  const moveItem = (id: string, direction: -1 | 1) => {
    const index = items.findIndex((item) => item.id === id)
    if (index < 0) return
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    setItems(next)
  }

  const updateCaption = (id: string, caption: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, caption } : item)))
  }

  return (
    <NodeViewWrapper
      as="figure"
      className={`editor-gallery ${selected ? 'editor-gallery--selected' : ''}`}
      data-type="gallery"
      data-drag-handle
    >
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => uploadFiles(e.target.files, 'image')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => uploadFiles(e.target.files, 'video')}
      />

      <div className="editor-gallery__toolbar">
        <span className="editor-gallery__label">Gallery</span>
        <div className="editor-gallery__cols">
          {([2, 3, 4] as const).map((count) => (
            <button
              key={count}
              type="button"
              className={`editor-gallery__col-btn ${columns === count ? 'editor-gallery__col-btn--active' : ''}`}
              onClick={() => setColumns(count)}
              title={`${count} columns`}
            >
              {count}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="editor-gallery__action"
          disabled={uploading}
          onClick={() => imageInputRef.current?.click()}
        >
          + Photos
        </button>
        <button
          type="button"
          className="editor-gallery__action"
          disabled={uploading}
          onClick={() => videoInputRef.current?.click()}
        >
          + Videos
        </button>
        {selected && (
          <button type="button" className="editor-gallery__action editor-gallery__action--danger" onClick={deleteNode}>
            Remove gallery
          </button>
        )}
      </div>

      {uploading && <p className="editor-gallery__status">Uploading…</p>}
      {error && <p className="editor-gallery__error">{error}</p>}

      {items.length === 0 ? (
        <div className="editor-gallery__empty">
          <p>Add photos or videos to build a grid gallery.</p>
          <div className="editor-gallery__empty-actions">
            <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
              Add photos
            </button>
            <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploading}>
              Add videos
            </button>
          </div>
        </div>
      ) : (
        <div className={`editor-gallery__grid editor-gallery__grid--cols-${columns}`}>
          {items.map((item, index) => (
            <div key={item.id} className={`editor-gallery__item editor-gallery__item--${item.type}`}>
              {item.type === 'image' ? (
                <img src={item.src} alt={item.alt || ''} draggable={false} />
              ) : (
                <div className="editor-gallery__video">
                  <video src={item.src} muted playsInline preload="metadata" poster={item.poster} />
                  <span className="editor-gallery__video-badge" aria-hidden="true">▶</span>
                </div>
              )}
              {selected && (
                <div className="editor-gallery__item-controls">
                  <button type="button" onClick={() => moveItem(item.id, -1)} disabled={index === 0} title="Move left">
                    ←
                  </button>
                  <button type="button" onClick={() => moveItem(item.id, 1)} disabled={index === items.length - 1} title="Move right">
                    →
                  </button>
                  <button type="button" onClick={() => removeItem(item.id)} title="Remove" className="editor-gallery__item-remove">
                    ×
                  </button>
                </div>
              )}
              {selected ? (
                <input
                  type="text"
                  value={item.caption ?? ''}
                  placeholder="Caption (optional)"
                  className="editor-gallery__caption-input"
                  onChange={(e) => updateCaption(item.id, e.target.value)}
                />
              ) : (
                item.caption && <p className="editor-gallery__caption">{item.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </NodeViewWrapper>
  )
}
