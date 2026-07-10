import { useEffect, useRef, useState } from 'react'
import { MATH_CATEGORIES, MATH_TEMPLATES } from '../data/mathPalette'
import { renderKatexHtml } from '../utils/katexRender'

export interface EquationEditorSubmit {
  latex: string
  display: boolean
}

interface EquationEditorProps {
  open: boolean
  initialLatex?: string
  initialDisplay?: boolean
  onClose: () => void
  onSubmit: (value: EquationEditorSubmit) => void
}

export default function EquationEditor({
  open,
  initialLatex = '',
  initialDisplay = false,
  onClose,
  onSubmit,
}: EquationEditorProps) {
  const [latex, setLatex] = useState(initialLatex)
  const [display, setDisplay] = useState(initialDisplay)
  const [activeCategory, setActiveCategory] = useState(MATH_CATEGORIES[0]?.name ?? 'Greek')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    setLatex(initialLatex)
    setDisplay(initialDisplay)
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [open, initialLatex, initialDisplay])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const previewHtml = renderKatexHtml(latex, display)
  const previewError = previewHtml.includes('math-error') && latex.trim()

  const insertAtCursor = (snippet: string) => {
    const el = textareaRef.current
    if (!el) {
      setLatex((prev) => prev + snippet)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = latex.slice(0, start) + snippet + latex.slice(end)
    setLatex(next)
    const caret = start + snippet.length
    window.requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(caret, caret)
    })
  }

  const handleSubmit = () => {
    if (!latex.trim()) return
    onSubmit({ latex: latex.trim(), display })
    onClose()
  }

  return (
    <div className="equation-editor-backdrop" role="presentation" onClick={onClose}>
      <div
        className="equation-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="equation-editor-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="equation-editor__header">
          <div>
            <h2 id="equation-editor-title" className="equation-editor__title">Equation editor</h2>
            <p className="equation-editor__subtitle">LaTeX input with live preview — inline or display mode</p>
          </div>
          <button type="button" onClick={onClose} className="equation-editor__close" aria-label="Close">
            ×
          </button>
        </header>

        <div className="equation-editor__mode">
          <button
            type="button"
            className={`equation-editor__mode-btn ${!display ? 'equation-editor__mode-btn--active' : ''}`}
            onClick={() => setDisplay(false)}
          >
            Inline
          </button>
          <button
            type="button"
            className={`equation-editor__mode-btn ${display ? 'equation-editor__mode-btn--active' : ''}`}
            onClick={() => setDisplay(true)}
          >
            Display (centered block)
          </button>
        </div>

        <div className="equation-editor__body">
          <div className="equation-editor__input-col">
            <label className="equation-editor__label" htmlFor="equation-latex-input">LaTeX</label>
            <textarea
              id="equation-latex-input"
              ref={textareaRef}
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="e.g. E = mc^2  or  \int_0^\infty e^{-x^2} dx"
              className="equation-editor__textarea"
              spellCheck={false}
              rows={8}
            />
            <p className="equation-editor__hint">
              Tip: use <code>{'\\frac{a}{b}'}</code>, <code>{'\\sqrt{x}'}</code>, <code>{'x^{2}'}</code>, matrices with <code>{'\\begin{pmatrix}...\\end{pmatrix}'}</code>
            </p>
          </div>

          <div className="equation-editor__preview-col">
            <p className="equation-editor__label">Preview</p>
            <div
              className={`equation-editor__preview ${display ? 'equation-editor__preview--display' : 'equation-editor__preview--inline'} ${previewError ? 'equation-editor__preview--error' : ''}`}
              dangerouslySetInnerHTML={{
                __html: previewHtml || '<span class="equation-editor__preview-empty">Preview appears here</span>',
              }}
            />
          </div>
        </div>

        <section className="equation-editor__templates">
          <p className="equation-editor__label">Templates</p>
          <div className="equation-editor__template-grid">
            {MATH_TEMPLATES.map((template) => (
              <button
                key={template.name}
                type="button"
                className="equation-editor__template"
                title={template.description}
                onClick={() => {
                  setLatex(template.latex)
                  if (template.display != null) setDisplay(template.display)
                }}
              >
                <span className="equation-editor__template-name">{template.name}</span>
                <span className="equation-editor__template-desc">{template.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="equation-editor__symbols">
          <div className="equation-editor__symbol-tabs">
            {MATH_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                className={`equation-editor__symbol-tab ${activeCategory === cat.name ? 'equation-editor__symbol-tab--active' : ''}`}
                onClick={() => setActiveCategory(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="equation-editor__symbol-grid">
            {(MATH_CATEGORIES.find((c) => c.name === activeCategory)?.symbols ?? []).map((symbol) => (
              <button
                key={`${symbol.latex}-${symbol.label}`}
                type="button"
                className="equation-editor__symbol"
                title={symbol.title ?? symbol.latex}
                onClick={() => insertAtCursor(symbol.latex)}
              >
                {symbol.label}
              </button>
            ))}
          </div>
        </section>

        <footer className="equation-editor__footer">
          <button type="button" onClick={onClose} className="equation-editor__footer-btn equation-editor__footer-btn--ghost">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!latex.trim()}
            className="equation-editor__footer-btn equation-editor__footer-btn--primary"
          >
            Insert equation
          </button>
        </footer>
      </div>
    </div>
  )
}
