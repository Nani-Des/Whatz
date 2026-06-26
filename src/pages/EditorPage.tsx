import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Editor from '../components/Editor'
import { createPost, getPost, updatePost } from '../services/posts'
import type { PostStatus } from '../types/post'

const AUTOSAVE_INTERVAL = 30000

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<PostStatus>('draft')
  const [postId, setPostId] = useState<string | null>(isNew ? null : id)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [error, setError] = useState('')

  const titleRef = useRef(title)
  const tagsRef = useRef(tagsInput)
  const contentRef = useRef(content)
  const statusRef = useRef(status)
  const postIdRef = useRef(postId)

  titleRef.current = title
  tagsRef.current = tagsInput
  contentRef.current = content
  statusRef.current = status
  postIdRef.current = postId

  useEffect(() => {
    if (isNew) return
    getPost(id!)
      .then((post) => {
        if (!post) {
          setError('Post not found.')
          return
        }
        setTitle(post.title)
        setTagsInput(post.tags.join(', '))
        setContent(post.content)
        setStatus(post.status)
        setPostId(post.id)
      })
      .catch(() => setError('Failed to load post.'))
      .finally(() => setLoading(false))
  }, [id, isNew])

  const saveDraft = useCallback(async (silent = false) => {
    const data = {
      title: titleRef.current,
      content: contentRef.current,
      tags: parseTags(tagsRef.current),
      status: 'draft' as PostStatus,
    }

    setSaving(true)
    if (!silent) setSaveMessage('Saving...')

    try {
      if (postIdRef.current) {
        await updatePost(postIdRef.current, data)
      } else {
        const newId = await createPost(data)
        setPostId(newId)
        postIdRef.current = newId
        if (!silent) {
          navigate(`/editor/${newId}`, { replace: true })
        }
      }
      setStatus('draft')
      statusRef.current = 'draft'
      setSaveMessage('Draft saved')
      setTimeout(() => setSaveMessage(''), 2000)
    } catch {
      setSaveMessage('')
      if (!silent) setError('Failed to save draft.')
    } finally {
      setSaving(false)
    }
  }, [navigate])

  useEffect(() => {
    const interval = setInterval(() => {
      if (titleRef.current || contentRef.current) {
        saveDraft(true)
      }
    }, AUTOSAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [saveDraft])

  const handlePublish = async () => {
    const data = {
      title: title,
      content: content,
      tags: parseTags(tagsInput),
      status: 'published' as PostStatus,
    }

    setSaving(true)
    setSaveMessage('Publishing...')

    try {
      if (postId) {
        await updatePost(postId, data)
      } else {
        const newId = await createPost(data)
        setPostId(newId)
      }
      setStatus('published')
      setSaveMessage('Published!')
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch {
      setError('Failed to publish post.')
      setSaveMessage('')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f9]">
        <p className="text-gray-500">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[816px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <span className="text-lg leading-none">←</span>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {saveMessage && (
              <span className="text-xs text-gray-400 tabular-nums">{saveMessage}</span>
            )}
            {status === 'published' && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/60">
                Published
              </span>
            )}
            <button
              type="button"
              onClick={() => saveDraft(false)}
              disabled={saving}
              className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              Publish
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[816px] px-4 py-6 sm:px-6 sm:py-8">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">
            {error}
          </p>
        )}

        <div className="mb-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full border-0 bg-transparent text-[2rem] sm:text-[2.25rem] font-normal text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 leading-tight tracking-tight"
          />
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Add tags separated by commas"
            className="w-full border-0 bg-transparent text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-0"
          />
        </div>

        <Editor content={content} onChange={setContent} />
      </main>
    </div>
  )
}
