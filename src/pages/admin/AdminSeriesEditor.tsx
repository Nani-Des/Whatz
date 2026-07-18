import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import ShareButton from '../../components/ShareButton'
import { createSeries, getSeries, updateSeries, seriesShareUrl } from '../../services/series'
import { uploadSeriesCover } from '../../services/storage'
import type { SeriesInput, SeriesStatus } from '../../types/series'
import { slugify } from '../../utils/slug'
import { seriesHubPath } from '../../utils/series'

const EMPTY: SeriesInput = {
  title: '',
  slug: '',
  description: '',
  excerpt: '',
  coverImageUrl: '',
  demoUrl: '',
  repoUrl: '',
  techStack: [],
  status: 'active',
  featured: false,
}

function parseTechStack(input: string): string[] {
  return input.split(',').map((t) => t.trim()).filter(Boolean)
}

export default function AdminSeriesEditor() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [form, setForm] = useState<SeriesInput>(EMPTY)
  const [techStackInput, setTechStackInput] = useState('')
  const [seriesId, setSeriesId] = useState<string | null>(isNew ? null : id ?? null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    getSeries(id!)
      .then((item) => {
        if (!item) {
          setError('Series not found.')
          return
        }
        setForm({
          title: item.title,
          slug: item.slug,
          description: item.description,
          excerpt: item.excerpt,
          coverImageUrl: item.coverImageUrl,
          demoUrl: item.demoUrl,
          repoUrl: item.repoUrl,
          techStack: item.techStack,
          status: item.status,
          featured: item.featured,
        })
        setTechStackInput(item.techStack.join(', '))
        setSeriesId(item.id)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load series.'))
      .finally(() => setLoading(false))
  }, [id, isNew])

  const handleChange = (field: keyof SeriesInput, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && (!prev.slug || prev.slug === slugify(prev.title))) {
        next.slug = slugify(value as string)
      }
      return next
    })
  }

  const handleCoverUpload = async (file: File) => {
    try {
      let sid = seriesId
      if (!sid) {
        sid = await createSeries({ ...form, techStack: parseTechStack(techStackInput), title: form.title || 'Untitled series' })
        setSeriesId(sid)
        navigate(`/dashboard/series/${sid}`, { replace: true })
      }
      const urls = await uploadSeriesCover(sid, file)
      setForm((prev) => ({ ...prev, coverImageUrl: urls.full }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cover upload failed.')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const payload: SeriesInput = {
      ...form,
      slug: form.slug || slugify(form.title),
      techStack: parseTechStack(techStackInput),
    }
    try {
      if (seriesId) {
        await updateSeries(seriesId, payload)
        setMessage('Series saved.')
      } else {
        const newId = await createSeries(payload)
        setSeriesId(newId)
        navigate(`/dashboard/series/${newId}`, { replace: true })
        setMessage('Series created.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save series.')
    } finally {
      setSaving(false)
    }
  }

  const slug = form.slug || (form.title ? slugify(form.title) : '')

  return (
    <AdminLayout active="series">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">{isNew ? 'New series' : 'Edit series'}</h1>
          <p className="mt-1 text-sm text-neutral-400">Series hub metadata, cover, and links</p>
        </div>
        <Link to="/dashboard/series" className="text-sm text-neutral-300 hover:underline">
          ← All series
        </Link>
      </div>

      {loading && <p className="text-neutral-400">Loading…</p>}

      {!loading && (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-400">{message}</p>}

          {seriesId && slug && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <ShareButton
                title={form.title || 'Series'}
                shareUrl={seriesShareUrl(slug)}
                label="Share series"
                variant="dark"
                className="!px-3 !py-1.5 !text-xs"
              />
              <a
                href={seriesHubPath(slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
              >
                Preview hub
              </a>
            </div>
          )}

          <label className="block">
            <span className="text-sm text-neutral-400">Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-neutral-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm text-neutral-400">URL slug</span>
            <input
              type="text"
              value={form.slug ?? ''}
              onChange={(e) => handleChange('slug', slugify(e.target.value))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-neutral-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm text-neutral-400">Short excerpt</span>
            <textarea
              value={form.excerpt ?? ''}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-neutral-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm text-neutral-400">Description</span>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-neutral-500 focus:outline-none"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-neutral-400">Demo URL</span>
              <input
                type="url"
                value={form.demoUrl ?? ''}
                onChange={(e) => handleChange('demoUrl', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-neutral-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-neutral-400">Repo URL</span>
              <input
                type="url"
                value={form.repoUrl ?? ''}
                onChange={(e) => handleChange('repoUrl', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-neutral-500 focus:outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-neutral-400">Tech stack (comma-separated)</span>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-neutral-500 focus:outline-none"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-neutral-400">Status</span>
              <select
                value={form.status ?? 'active'}
                onChange={(e) => handleChange('status', e.target.value as SeriesStatus)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="complete">Complete</option>
                <option value="paused">Paused</option>
              </select>
            </label>
            <label className="flex items-center gap-2 pt-7 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={form.featured ?? false}
                onChange={(e) => handleChange('featured', e.target.checked)}
              />
              Featured on home
            </label>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <span className="text-sm text-neutral-400">Cover image</span>
            {form.coverImageUrl && (
              <img src={form.coverImageUrl} alt="" className="mt-2 max-h-48 rounded-lg object-cover" />
            )}
            <input
              type="file"
              accept="image/*"
              className="mt-2 w-full text-xs text-neutral-400"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleCoverUpload(file)
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            {saving ? 'Saving…' : seriesId ? 'Save series' : 'Create series'}
          </button>
        </form>
      )}
    </AdminLayout>
  )
}
