import { useState } from 'react'

interface ShareButtonProps {
  title: string
  slug?: string
  variant?: 'light' | 'dark'
  className?: string
}

export default function ShareButton({ title, slug, variant = 'dark', className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? slug
      ? `${window.location.origin}/post/s/${slug}`
      : window.location.href
    : ''

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // fall through to copy
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const styles =
    variant === 'light'
      ? 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 hover:text-black'
      : 'border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-900 hover:text-white'

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${styles} ${className}`}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      {copied ? 'Link copied!' : 'Share'}
    </button>
  )
}
