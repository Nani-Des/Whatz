import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

export default function VideoEditorView({ node, deleteNode, selected }: NodeViewProps) {
  const src = node.attrs.src as string
  const poster = node.attrs.poster as string | null
  const title = node.attrs.title as string | null

  return (
    <NodeViewWrapper
      as="figure"
      className={`editor-video ${selected ? 'editor-video--selected' : ''}`}
      data-type="video"
      data-src={src}
      data-poster={poster ?? undefined}
      data-title={title ?? undefined}
    >
      <div className="editor-video__toolbar">
        <span className="editor-video__label">Video</span>
        <button type="button" onClick={deleteNode} className="editor-video__remove">
          Remove
        </button>
      </div>
      <video
        src={src}
        poster={poster ?? undefined}
        controls
        playsInline
        preload="metadata"
        className="editor-video__player"
        title={title ?? undefined}
      />
    </NodeViewWrapper>
  )
}
