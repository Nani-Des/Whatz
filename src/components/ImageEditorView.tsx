import { useCallback, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { formatDimension } from '../lib/imageExtension'

export default function ImageEditorView({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const src = node.attrs.src as string
  const width = node.attrs.width as string | null
  const height = node.attrs.height as string | null

  const widthCss = formatDimension(width) ?? undefined
  const heightCss = formatDimension(height) ?? undefined

  const startResize = useCallback(
    (axis: 'width' | 'height' | 'both') => (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      const img = imgRef.current
      if (!img) return

      const startX = event.clientX
      const startY = event.clientY
      const startWidth = img.offsetWidth
      const startHeight = img.offsetHeight
      const ratio = startWidth / Math.max(startHeight, 1)

      const onMove = (ev: MouseEvent) => {
        if (axis === 'width' || axis === 'both') {
          const nextWidth = Math.max(80, Math.round(startWidth + ev.clientX - startX))
          if (axis === 'both') {
            updateAttributes({
              width: nextWidth,
              height: Math.max(60, Math.round(nextWidth / ratio)),
            })
          } else {
            updateAttributes({ width: nextWidth, height: height ?? null })
          }
        } else {
          const nextHeight = Math.max(60, Math.round(startHeight + ev.clientY - startY))
          updateAttributes({ height: nextHeight, width: width ?? null })
        }
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [height, updateAttributes, width],
  )

  return (
    <NodeViewWrapper
      as="figure"
      className={`editor-image ${selected ? 'editor-image--selected' : ''}`}
      data-drag-handle
    >
      <img
        ref={imgRef}
        src={src}
        alt=""
        draggable={false}
        style={{
          width: widthCss,
          height: heightCss ?? (widthCss ? 'auto' : undefined),
          maxWidth: '100%',
        }}
      />
      {selected && (
        <>
          <div
            className="editor-image__handle editor-image__handle--corner"
            onMouseDown={startResize('both')}
            title="Drag to resize"
            aria-hidden="true"
          />
          <div
            className="editor-image__handle editor-image__handle--width"
            onMouseDown={startResize('width')}
            title="Drag to adjust width"
            aria-hidden="true"
          />
          <div
            className="editor-image__handle editor-image__handle--height"
            onMouseDown={startResize('height')}
            title="Drag to adjust height"
            aria-hidden="true"
          />
          <div className="editor-image__toolbar">
            <button type="button" onClick={deleteNode} className="editor-image__remove">
              Remove
            </button>
          </div>
        </>
      )}
    </NodeViewWrapper>
  )
}
