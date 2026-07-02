import { useEffect, useRef, useState } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

export default function CollapsibleView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const titleRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const el = titleRef.current
    if (el && document.activeElement !== el) {
      el.textContent = node.attrs.title as string
    }
  }, [node.attrs.title])

  const saveTitle = () => {
    const text = titleRef.current?.textContent?.trim()
    updateAttributes({ title: text || 'Section title' })
  }

  return (
    <NodeViewWrapper
      as="details"
      className={`collapsible-block collapsible-block--editor ${selected ? 'collapsible-block--selected' : ''}`}
      data-type="collapsible"
      open={open}
    >
      <summary
        className="collapsible-summary"
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (target.closest('.collapsible-title') || target.closest('.collapsible-actions')) {
            e.preventDefault()
          }
        }}
      >
        <button
          type="button"
          className="collapsible-chevron-btn"
          aria-label={open ? 'Collapse section' : 'Expand section'}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen((v) => !v)
          }}
        >
          <span className={`collapsible-chevron ${open ? 'collapsible-chevron--open' : ''}`} aria-hidden="true">
            ▸
          </span>
        </button>
        <span
          ref={titleRef}
          className="collapsible-title"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="Section title"
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              saveTitle()
              titleRef.current?.blur()
            }
          }}
        />
        <span className="collapsible-actions">
          <button
            type="button"
            className="collapsible-delete"
            aria-label="Remove section"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              deleteNode()
            }}
          >
            Remove
          </button>
        </span>
      </summary>
      <div className="collapsible-content">
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  )
}
