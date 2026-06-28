import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import type { Editor, Range } from '@tiptap/core'

export interface SlashCommandItem {
  title: string
  description: string
  icon: string
  command: (props: { editor: Editor; range: Range }) => void
}

interface SlashCommandListProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
}

const SlashCommandList = forwardRef<{ onKeyDown: (e: KeyboardEvent) => boolean }, SlashCommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i + items.length - 1) % items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          const item = items[selectedIndex]
          if (item) command(item)
          return true
        }
        return false
      },
    }))

    if (items.length === 0) {
      return (
        <div className="slash-menu rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-500 shadow-lg">
          No results
        </div>
      )
    }

    return (
      <div className="slash-menu max-h-72 w-64 overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`flex w-full items-start gap-3 px-3 py-2 text-left text-sm transition-colors ${
              index === selectedIndex ? 'bg-neutral-100 text-black' : 'text-neutral-700 hover:bg-neutral-50'
            }`}
            onClick={() => command(item)}
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-xs font-medium">
              {item.icon}
            </span>
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="block text-xs text-neutral-500">{item.description}</span>
            </span>
          </button>
        ))}
      </div>
    )
  },
)

SlashCommandList.displayName = 'SlashCommandList'
export default SlashCommandList
