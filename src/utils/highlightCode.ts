import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('plaintext', () => ({ name: 'Plain text', contains: [] }))
hljs.registerLanguage('text', () => ({ name: 'Plain text', contains: [] }))

function highlightCodeElement(block: HTMLElement): void {
  if (block.dataset.highlighted === 'yes') return
  hljs.highlightElement(block)
  block.dataset.highlighted = 'yes'
}

/** Highlight code blocks in a live DOM subtree. */
export function hydrateCodeBlocks(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('pre code').forEach(highlightCodeElement)
}

/** Bake syntax highlighting into HTML so React re-renders do not wipe it. */
export function prepareCodeHtml(html: string): string {
  if (!html.includes('<pre')) return html

  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll<HTMLElement>('pre code').forEach(highlightCodeElement)
  return doc.body.innerHTML
}

export { hljs }
