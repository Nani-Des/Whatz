import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { ResizableImage } from './imageExtension'
import { MathInline, MathBlock } from './mathExtension'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { TextStyle } from '@tiptap/extension-text-style'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { FontSize } from './fontSizeExtension'
import { FontFamily } from './fontFamilyExtension'
import { Callout } from './calloutExtension'
import { Collapsible } from './collapsibleExtension'
import { CodeBlockWithLanguage } from './codeBlockExtension'
import { SlashCommand } from './slashCommandExtension'
import { Citation } from './citationExtension'
import { Video } from './videoExtension'
import { PostLink } from './postLinkExtension'

const sharedKit = {
  heading: { levels: [1, 2, 3] as (1 | 2 | 3)[] },
  link: false as const,
  underline: false as const,
  codeBlock: false as const,
}

export const editorExtensions = [
  StarterKit.configure(sharedKit),
  CodeBlockWithLanguage,
  Underline,
  Subscript,
  Superscript,
  TextStyle,
  FontSize,
  FontFamily,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight.configure({ multicolor: false }),
  ResizableImage.configure({ inline: false, allowBase64: false }),
  MathInline,
  MathBlock,
  Video,
  PostLink,
  Link.configure({ openOnClick: false, autolink: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  Callout,
  Collapsible,
  Placeholder.configure({
    placeholder: 'Start writing… Type / for commands',
  }),
  CharacterCount,
  SlashCommand,
]

export function createEditorExtensions(getCitationNumber: (refId: string) => number | null) {
  return [
    ...editorExtensions,
    Citation.configure({ getCitationNumber }),
  ]
}

export const contentExtensions = [
  StarterKit.configure(sharedKit),
  CodeBlockWithLanguage,
  Underline,
  Subscript,
  Superscript,
  TextStyle,
  FontSize,
  FontFamily,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight,
  ResizableImage,
  MathInline,
  MathBlock,
  Video,
  PostLink,
  Link,
  Table,
  TableRow,
  TableHeader,
  TableCell,
  Callout,
  Collapsible,
  Citation.configure({ getCitationNumber: () => null }),
]
