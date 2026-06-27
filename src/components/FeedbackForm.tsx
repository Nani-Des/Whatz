import { useState, type FormEvent } from 'react'
import { submitFeedback } from '../services/feedback'

interface FeedbackFormProps {
  postId: string
  postTitle: string
}

export default function FeedbackForm({ postId, postTitle }: FeedbackFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

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
      <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6 text-center">
        <p className="font-medium text-white">Thanks for your feedback!</p>
        <p className="mt-1 text-sm text-neutral-400">Your message has been sent.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm text-neutral-300 hover:underline"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
      <h3 className="text-lg font-semibold text-white">Leave feedback</h3>
      <p className="mt-1 text-sm text-neutral-400">Share your thoughts on this article.</p>

      {error && (
        <p className="mt-4 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300">{error}</p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="rounded-xl border border-neutral-800 bg-black px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          className="rounded-xl border border-neutral-800 bg-black px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={4}
        placeholder="Your feedback..."
        className="mt-3 w-full rounded-xl border border-neutral-800 bg-black px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
      />

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50 transition-colors"
      >
        {status === 'loading' ? 'Sending...' : 'Submit feedback'}
      </button>
    </form>
  )
}
