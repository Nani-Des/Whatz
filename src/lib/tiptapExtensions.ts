import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { TextStyle } from '@tiptap/extension-text-style'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { FontSize } from './fontSizeExtension'

const sharedKit = {
  heading: { levels: [1, 2, 3] as (1 | 2 | 3)[] },
}

export const editorExtensions = [
  StarterKit.configure(sharedKit),
  Underline,
  TextStyle,
  FontSize,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight.configure({ multicolor: false }),
  Image.configure({ inline: false, allowBase64: true }),
  Link.configure({ openOnClick: false, autolink: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  Placeholder.configure({
    placeholder: 'Start writing something amazing...',
  }),
  CharacterCount,
]

export const contentExtensions = [
  StarterKit.configure(sharedKit),
  Underline,
  TextStyle,
  FontSize,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight,
  Image,
  Link,
  Table,
  TableRow,
  TableHeader,
  TableCell,
]
