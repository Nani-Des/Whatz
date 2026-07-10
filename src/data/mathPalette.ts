export interface MathSymbol {
  latex: string
  label: string
  title?: string
}

export interface MathCategory {
  name: string
  symbols: MathSymbol[]
}

export interface MathTemplate {
  name: string
  latex: string
  description: string
  display?: boolean
}

export const MATH_CATEGORIES: MathCategory[] = [
  {
    name: 'Greek',
    symbols: [
      { latex: '\\alpha', label: 'α' }, { latex: '\\beta', label: 'β' }, { latex: '\\gamma', label: 'γ' },
      { latex: '\\delta', label: 'δ' }, { latex: '\\epsilon', label: 'ε' }, { latex: '\\zeta', label: 'ζ' },
      { latex: '\\eta', label: 'η' }, { latex: '\\theta', label: 'θ' }, { latex: '\\lambda', label: 'λ' },
      { latex: '\\mu', label: 'μ' }, { latex: '\\pi', label: 'π' }, { latex: '\\rho', label: 'ρ' },
      { latex: '\\sigma', label: 'σ' }, { latex: '\\tau', label: 'τ' }, { latex: '\\phi', label: 'φ' },
      { latex: '\\omega', label: 'ω' }, { latex: '\\Gamma', label: 'Γ' }, { latex: '\\Delta', label: 'Δ' },
      { latex: '\\Theta', label: 'Θ' }, { latex: '\\Lambda', label: 'Λ' }, { latex: '\\Sigma', label: 'Σ' },
      { latex: '\\Phi', label: 'Φ' }, { latex: '\\Omega', label: 'Ω' },
    ],
  },
  {
    name: 'Operators',
    symbols: [
      { latex: '\\pm', label: '±' }, { latex: '\\mp', label: '∓' }, { latex: '\\times', label: '×' },
      { latex: '\\div', label: '÷' }, { latex: '\\cdot', label: '·' }, { latex: '\\ast', label: '∗' },
      { latex: '\\star', label: '★' }, { latex: '\\circ', label: '∘' }, { latex: '\\bullet', label: '•' },
      { latex: '\\oplus', label: '⊕' }, { latex: '\\otimes', label: '⊗' }, { latex: '\\leq', label: '≤' },
      { latex: '\\geq', label: '≥' }, { latex: '\\neq', label: '≠' }, { latex: '\\approx', label: '≈' },
      { latex: '\\equiv', label: '≡' }, { latex: '\\propto', label: '∝' }, { latex: '\\infty', label: '∞' },
    ],
  },
  {
    name: 'Calculus',
    symbols: [
      { latex: '\\partial', label: '∂' }, { latex: '\\nabla', label: '∇' }, { latex: '\\int', label: '∫' },
      { latex: '\\iint', label: '∬' }, { latex: '\\iiint', label: '∭' }, { latex: '\\oint', label: '∮' },
      { latex: '\\sum', label: '∑' }, { latex: '\\prod', label: '∏' }, { latex: '\\lim', label: 'lim' },
      { latex: '\\to', label: '→' }, { latex: '\\rightarrow', label: '→' }, { latex: '\\leftarrow', label: '←' },
      { latex: '\\Rightarrow', label: '⇒' }, { latex: '\\Leftrightarrow', label: '⇔' },
    ],
  },
  {
    name: 'Structures',
    symbols: [
      { latex: '\\frac{a}{b}', label: 'a/b', title: 'Fraction' },
      { latex: '\\sqrt{x}', label: '√', title: 'Square root' },
      { latex: '\\sqrt[n]{x}', label: 'ⁿ√', title: 'nth root' },
      { latex: 'x^{n}', label: 'xⁿ', title: 'Superscript' },
      { latex: 'x_{n}', label: 'xₙ', title: 'Subscript' },
      { latex: '\\binom{n}{k}', label: 'C', title: 'Binomial' },
      { latex: '\\left( \\right)', label: '( )', title: 'Auto-sized parens' },
      { latex: '\\left[ \\right]', label: '[ ]', title: 'Auto-sized brackets' },
      { latex: '\\left\\{ \\right\\}', label: '{ }', title: 'Auto-sized braces' },
      { latex: '\\left| \\right|', label: '| |', title: 'Absolute value' },
    ],
  },
  {
    name: 'Sets & Logic',
    symbols: [
      { latex: '\\in', label: '∈' }, { latex: '\\notin', label: '∉' }, { latex: '\\subset', label: '⊂' },
      { latex: '\\supset', label: '⊃' }, { latex: '\\cup', label: '∪' }, { latex: '\\cap', label: '∩' },
      { latex: '\\emptyset', label: '∅' }, { latex: '\\forall', label: '∀' }, { latex: '\\exists', label: '∃' },
      { latex: '\\land', label: '∧' }, { latex: '\\lor', label: '∨' }, { latex: '\\neg', label: '¬' },
    ],
  },
]

export const MATH_TEMPLATES: MathTemplate[] = [
  { name: 'Quadratic formula', description: 'Roots of ax²+bx+c=0', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', display: true },
  { name: 'Pythagorean theorem', description: 'a² + b² = c²', latex: 'a^2 + b^2 = c^2', display: true },
  { name: 'Euler identity', description: 'e^(iπ)+1=0', latex: 'e^{i\\pi} + 1 = 0', display: true },
  { name: 'Taylor series', description: 'Function expansion', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n', display: true },
  { name: 'Definite integral', description: 'Integral from a to b', latex: '\\int_{a}^{b} f(x)\\, dx', display: true },
  { name: 'Derivative', description: 'Leibniz notation', latex: '\\frac{df}{dx}', display: false },
  { name: 'Partial derivative', description: 'Multivariable', latex: '\\frac{\\partial f}{\\partial x}', display: false },
  { name: 'Matrix 2×2', description: 'Square matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', display: true },
  { name: 'Matrix 3×3', description: '3×3 matrix', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', display: true },
  { name: 'Aligned equations', description: 'Multi-line align', latex: '\\begin{aligned} f(x) &= x^2 \\\\ g(x) &= 2x + 1 \\end{aligned}', display: true },
  { name: 'Cases', description: 'Piecewise function', latex: 'f(x) = \\begin{cases} x^2 & x \\geq 0 \\\\ -x & x < 0 \\end{cases}', display: true },
  { name: 'Bayes theorem', description: 'Probability', latex: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}', display: true },
  { name: 'Gaussian', description: 'Normal distribution', latex: 'f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}', display: true },
  { name: 'Vector norm', description: 'L2 norm', latex: '\\|\\mathbf{v}\\| = \\sqrt{\\sum_{i=1}^{n} v_i^2}', display: true },
  { name: 'Einstein summation', description: 'Index notation', latex: 'C_{ij} = \\sum_k A_{ik} B_{kj}', display: true },
]
