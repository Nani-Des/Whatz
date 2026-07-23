import { useEffect, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import {
  TEXT_STICKER_COLORS,
  TEXT_STICKER_SHAPES,
  type TextStickerAlign,
  type TextStickerColor,
  type TextStickerShape,
} from '../types/textSticker'

const SHAPE_LABELS: Record<TextStickerShape, string> = {
  pill: 'Pill',
  tag: 'Tag',
  burst: 'Burst',
  note: 'Note',
  label: 'Label',
}

const COLOR_LABELS: Record<TextStickerColor, string> = {
  yellow: 'Yellow',
  coral: 'Coral',
  mint: 'Mint',
  sky: 'Sky',
  lavender: 'Lavender',
  dark: 'Dark',
}

export default function TextStickerEditorView({
  node,
  updateAttributes,
  selected,
  deleteNode,
}: NodeViewProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const text = String(node.attrs.text ?? '')
  const shape = node.attrs.shape as TextStickerShape
  const color = node.attrs.color as TextStickerColor
  const align = node.attrs.align as TextStickerAlign

  useEffect(() => {
    if (selected) inputRef.current?.focus()
  }, [selected])

  return (
    <NodeViewWrapper
      as="div"
      className={`text-sticker-editor text-sticker text-sticker--${shape} text-sticker--${color} text-sticker--align-${align} ${selected ? 'text-sticker-editor--selected' : ''}`}
      data-type="text-sticker"
      data-drag-handle
    >
      {selected && (
        <div className="text-sticker-editor__toolbar" contentEditable={false}>
          <span className="text-sticker-editor__toolbar-label">Sticker</span>
          <div className="text-sticker-editor__shapes">
            {TEXT_STICKER_SHAPES.map((item) => (
              <button
                key={item}
                type="button"
                className={`text-sticker-editor__chip ${shape === item ? 'text-sticker-editor__chip--active' : ''}`}
                title={SHAPE_LABELS[item]}
                onClick={() => updateAttributes({ shape: item })}
              >
                {SHAPE_LABELS[item]}
              </button>
            ))}
          </div>
          <div className="text-sticker-editor__colors">
            {TEXT_STICKER_COLORS.map((item) => (
              <button
                key={item}
                type="button"
                className={`text-sticker-editor__swatch text-sticker-editor__swatch--${item} ${color === item ? 'text-sticker-editor__swatch--active' : ''}`}
                title={COLOR_LABELS[item]}
                onClick={() => updateAttributes({ color: item })}
              />
            ))}
          </div>
          <div className="text-sticker-editor__align">
            {(['left', 'center', 'right'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={`text-sticker-editor__chip ${align === item ? 'text-sticker-editor__chip--active' : ''}`}
                onClick={() => updateAttributes({ align: item })}
              >
                {item}
              </button>
            ))}
          </div>
          <button type="button" className="text-sticker-editor__remove" onClick={deleteNode}>
            Remove
          </button>
        </div>
      )}

      <div className="text-sticker__body">
        <textarea
          ref={inputRef}
          value={text}
          rows={1}
          className="text-sticker__input"
          placeholder="Type your idea…"
          onChange={(e) => updateAttributes({ text: e.target.value })}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${el.scrollHeight}px`
          }}
        />
      </div>
    </NodeViewWrapper>
  )
}
