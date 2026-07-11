import type { Editor } from '@tiptap/react'

interface TableToolbarProps {
  editor: Editor
}

function TableBtn({
  onClick,
  disabled,
  title,
  children,
  danger,
}: {
  onClick: () => void
  disabled?: boolean
  title: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

export default function TableToolbar({ editor }: TableToolbarProps) {
  const chain = () => editor.chain().focus()

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1 rounded-md border border-gray-200 bg-white px-1 py-0.5">
      <span className="px-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">Table</span>

      <TableBtn onClick={() => chain().addColumnBefore().run()} title="Add column before">+ Col ←</TableBtn>
      <TableBtn onClick={() => chain().addColumnAfter().run()} title="Add column after">+ Col →</TableBtn>
      <TableBtn
        onClick={() => chain().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
        title="Delete column"
      >
        − Col
      </TableBtn>

      <span className="mx-0.5 h-4 w-px bg-gray-200" aria-hidden="true" />

      <TableBtn onClick={() => chain().addRowBefore().run()} title="Add row above">+ Row ↑</TableBtn>
      <TableBtn onClick={() => chain().addRowAfter().run()} title="Add row below">+ Row ↓</TableBtn>
      <TableBtn
        onClick={() => chain().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
        title="Delete row"
      >
        − Row
      </TableBtn>

      <span className="mx-0.5 h-4 w-px bg-gray-200" aria-hidden="true" />

      <TableBtn
        onClick={() => chain().toggleHeaderRow().run()}
        title="Toggle header row"
      >
        Header row
      </TableBtn>
      <TableBtn
        onClick={() => chain().toggleHeaderColumn().run()}
        title="Toggle header column"
      >
        Header col
      </TableBtn>

      <span className="mx-0.5 h-4 w-px bg-gray-200" aria-hidden="true" />

      <TableBtn
        onClick={() => chain().mergeCells().run()}
        disabled={!editor.can().mergeCells()}
        title="Merge selected cells"
      >
        Merge
      </TableBtn>
      <TableBtn
        onClick={() => chain().splitCell().run()}
        disabled={!editor.can().splitCell()}
        title="Split merged cell"
      >
        Split
      </TableBtn>

      <span className="mx-0.5 h-4 w-px bg-gray-200" aria-hidden="true" />

      <TableBtn onClick={() => chain().setTextAlign('left').run()} title="Align cell left">Align L</TableBtn>
      <TableBtn onClick={() => chain().setTextAlign('center').run()} title="Align cell center">Align C</TableBtn>
      <TableBtn onClick={() => chain().setTextAlign('right').run()} title="Align cell right">Align R</TableBtn>

      <span className="mx-0.5 h-4 w-px bg-gray-200" aria-hidden="true" />

      <TableBtn onClick={() => chain().deleteTable().run()} title="Delete entire table" danger>
        Delete
      </TableBtn>
    </div>
  )
}
