import katex from 'katex'

export function renderKatexHtml(latex: string, displayMode: boolean): string {
  if (!latex.trim()) return ''
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      trust: true,
      output: 'html',
    })
  } catch {
    return `<span class="math-error">${escapeHtml(latex)}</span>`
  }
}

export function renderKatexIntoElement(el: HTMLElement, latex: string, displayMode: boolean): void {
  if (!latex.trim()) {
    el.textContent = 'Empty equation'
    el.classList.add('math-error')
    return
  }
  try {
    katex.render(latex, el, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      trust: true,
    })
    el.classList.remove('math-error')
  } catch {
    el.textContent = latex
    el.classList.add('math-error')
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const MATH_SELECTOR = '[data-type="math"], .math-inline[data-latex], .math-block[data-latex]'

function readMathElement(el: HTMLElement): { latex: string; display: boolean } {
  const latex = el.getAttribute('data-latex') ?? ''
  const display =
    el.getAttribute('data-display') === 'true' ||
    el.classList.contains('math-block') ||
    el.tagName === 'DIV'
  return { latex, display }
}

/** Bake KaTeX into the HTML string so re-renders do not wipe rendered math. */
export function prepareMathHtml(html: string): string {
  if (!html.includes('data-type="math"') && !html.includes('data-latex')) return html

  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll<HTMLElement>(MATH_SELECTOR).forEach((el) => {
    const { latex, display } = readMathElement(el)
    if (!latex.trim()) return
    el.innerHTML = renderKatexHtml(latex, display)
    el.classList.add('math-rendered')
  })
  return doc.body.innerHTML
}

export function hydrateMathElements(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>(MATH_SELECTOR).forEach((el) => {
    if (el.classList.contains('math-rendered') && el.querySelector('.katex')) return
    const { latex, display } = readMathElement(el)
    renderKatexIntoElement(el, latex, display)
    el.classList.add('math-rendered')
  })
}
