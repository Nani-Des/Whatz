import { useEffect, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { renderKatexIntoElement } from '../utils/katexRender'

export default function MathNodeView({ node, selected, updateAttributes, deleteNode }: NodeViewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const latex = (node.attrs.latex as string) ?? ''
  const display = Boolean(node.attrs.display)

  useEffect(() => {
    if (!previewRef.current) return
    renderKatexIntoElement(previewRef.current, latex, display)
  }, [latex, display])

  const openEditor = () => {
    window.dispatchEvent(
      new CustomEvent('editor:edit-math', {
        detail: {
          latex,
          display,
          onSave: (nextLatex: string, nextDisplay: boolean) => {
            if (nextDisplay !== display) {
              deleteNode()
              window.dispatchEvent(
                new CustomEvent('editor:insert-math', {
                  detail: { latex: nextLatex, display: nextDisplay },
                }),
              )
              return
            }
            updateAttributes({ latex: nextLatex })
          },
        },
      }),
    )
  }

  return (
    <NodeViewWrapper
      as={display ? 'div' : 'span'}
      className={`editor-math ${display ? 'editor-math--block' : 'editor-math--inline'} ${selected ? 'editor-math--selected' : ''}`}
      data-type="math"
      data-latex={latex}
      data-display={display ? 'true' : 'false'}
    >
      <div
        role="button"
        tabIndex={0}
        className="editor-math__surface"
        onClick={openEditor}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openEditor()
          }
        }}
        title="Click to edit equation"
      >
        <div ref={previewRef} className="editor-math__preview" />
        {!latex.trim() && <span className="editor-math__placeholder">Click to add equation</span>}
      </div>
      {selected && (
        <div className="editor-math__actions">
          <button type="button" onClick={openEditor} className="editor-math__btn">Edit</button>
          <button type="button" onClick={deleteNode} className="editor-math__btn editor-math__btn--danger">Remove</button>
        </div>
      )}
    </NodeViewWrapper>
  )
}
