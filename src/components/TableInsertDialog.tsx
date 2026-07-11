import { useEffect, useState } from 'react'

export interface TableInsertOptions {
  rows: number
  cols: number
  withHeaderRow: boolean
}

interface TableInsertDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (options: TableInsertOptions) => void
}

const PRESETS: Array<{ label: string; rows: number; cols: number }> = [
  { label: '2 × 2', rows: 2, cols: 2 },
  { label: '3 × 3', rows: 3, cols: 3 },
  { label: '3 × 4', rows: 3, cols: 4 },
  { label: '4 × 5', rows: 4, cols: 5 },
  { label: '5 × 3', rows: 5, cols: 3 },
  { label: '6 × 6', rows: 6, cols: 6 },
]

function clampSize(value: number): number {
  return Math.min(20, Math.max(1, value))
}

export default function TableInsertDialog({ open, onClose, onSubmit }: TableInsertDialogProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [withHeaderRow, setWithHeaderRow] = useState(true)

  useEffect(() => {
    if (!open) return
    setRows(3)
    setCols(3)
    setWithHeaderRow(true)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = () => {
    onSubmit({ rows: clampSize(rows), cols: clampSize(cols), withHeaderRow })
    onClose()
  }

  return (
    <div className="equation-editor-backdrop" role="presentation" onClick={onClose}>
      <div
        className="equation-editor max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-insert-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="equation-editor__header">
          <div>
            <h2 id="table-insert-title" className="equation-editor__title">Insert table</h2>
            <p className="equation-editor__subtitle">Choose the size and header row option.</p>
          </div>
          <button type="button" className="equation-editor__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="space-y-4 px-5 pb-2 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="equation-editor__label">Rows</span>
              <input
                type="number"
                min={1}
                max={20}
                value={rows}
                onChange={(e) => setRows(clampSize(Number(e.target.value) || 1))}
                className="equation-editor__textarea !min-h-0 py-2"
              />
            </label>
            <label className="block">
              <span className="equation-editor__label">Columns</span>
              <input
                type="number"
                min={1}
                max={20}
                value={cols}
                onChange={(e) => setCols(clampSize(Number(e.target.value) || 1))}
                className="equation-editor__textarea !min-h-0 py-2"
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={withHeaderRow}
              onChange={(e) => setWithHeaderRow(e.target.checked)}
              className="rounded border-neutral-300"
            />
            First row is a header
          </label>

          <div>
            <p className="equation-editor__label">Quick sizes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setRows(preset.rows)
                    setCols(preset.cols)
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    rows === preset.rows && cols === preset.cols
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 p-3"
            aria-hidden="true"
          >
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${Math.min(cols, 8)}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: Math.min(rows, 6) * Math.min(cols, 8) }).map((_, i) => {
                const colCount = Math.min(cols, 8)
                const rowIndex = Math.floor(i / colCount)
                const isHeader = withHeaderRow && rowIndex === 0
                return (
                  <div
                    key={i}
                    className={`h-5 rounded-sm ${isHeader ? 'bg-neutral-400' : 'bg-neutral-300'}`}
                  />
                )
              })}
            </div>
            {(rows > 6 || cols > 8) && (
              <p className="mt-2 text-center text-[10px] text-neutral-500">Preview truncated</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Insert table
          </button>
        </div>
      </div>
    </div>
  )
}
