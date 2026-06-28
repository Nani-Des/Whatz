import { useState, type FormEvent } from 'react'
import { submitFeedback } from '../services/feedback'

interface FeedbackFormProps {
  postId: string
  postTitle: string
  variant?: 'light' | 'dark'
}

export default function FeedbackForm({ postId, postTitle, variant = 'dark' }: FeedbackFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const isLight = variant === 'light'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setStatus('loading')
    setError('')
    try {
      await submitFeedback({ postId, postTitle, name, email, message })
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to send feedback.')
    }
  }

  if (status === 'success') {
    return (
      <div
        className={`rounded-2xl border p-8 text-center ${
          isLight ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-700 bg-neutral-900'
        }`}
      >
        <p className={`font-medium ${isLight ? 'text-black' : 'text-white'}`}>Thanks for your feedback!</p>
        <p className={`mt-1 text-sm ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Your message has been sent.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className={`mt-4 text-sm underline underline-offset-2 ${isLight ? 'text-neutral-600 hover:text-black' : 'text-neutral-300 hover:text-white'}`}
        >
          Send another
        </button>
      </div>
    )
  }

  const inputClass = isLight
    ? 'rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200'
    : 'rounded-xl border border-neutral-800 bg-black px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none'

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border p-6 sm:p-8 ${
        isLight ? 'border-neutral-200 bg-neutral-50/50' : 'border-neutral-800 bg-neutral-950'
      }`}
    >
      <h3 className={`text-lg font-semibold ${isLight ? 'text-black' : 'text-white'}`}>Leave feedback</h3>
      <p className={`mt-1 text-sm ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
        Share your thoughts on this article.
      </p>

      {error && (
        <p
          className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            isLight ? 'border-neutral-200 bg-white text-neutral-700' : 'border-neutral-700 bg-neutral-900 text-neutral-300'
          }`}
        >
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className={inputClass}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          className={inputClass}
        />
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={4}
        placeholder="Your feedback…"
        className={`mt-3 w-full ${inputClass}`}
      />

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-5 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending…' : 'Submit feedback'}
      </button>
    </form>
  )
}
