import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getSeries } from '../services/series'
import Editor from '../components/Editor'
import ExcerptField from '../components/ExcerptField'
import FirestoreSetupBanner from '../components/FirestoreSetupBanner'
import MediaReferencesPanel from '../components/MediaReferencesPanel'
import PostReferencesPanel from '../components/PostReferencesPanel'
import VersionHistoryPanel from '../components/VersionHistoryPanel'
import AnimationSettingsPanel from '../components/AnimationSettingsPanel'
import { createPost, getPostForEdit, getPostsBySeriesId, updatePost } from '../services/posts'
import { savePostVersion } from '../services/versions'
import { uploadEditorImage, uploadEditorVideo, uploadPostCover } from '../services/storage'
import type { Post, PostAnimationSettings, PostInput, PostReference, PostStatus, PostType, PostVersion } from '../types/post'
import type { SeriesRole } from '../types/series'
import { DEFAULT_POST_ANIMATION } from '../types/post'
import { slugify } from '../utils/slug'
import { getExcerpt } from '../utils/excerpt'
import { contentHasBrokenMediaUrls } from '../utils/brokenMediaUrls'

const AUTOSAVE_INTERVAL = 30000

type VersionSnapshot = { title: string; content: string; excerpt: string; tags: string[] }

function versionFingerprint(snapshot: VersionSnapshot): string {
  return `${snapshot.title}\0${snapshot.content}\0${snapshot.excerpt}\0${snapshot.tags.join('\t')}`
}

function assertNoBlobUrls(content: string) {
  if (contentHasBrokenMediaUrls(content)) {
    throw new Error(
      'Some media uses temporary browser URLs and cannot be saved. Re-add gallery photos or videos, then save again.',
    )
  }
}

function toVersionSnapshot(data: PostInput): VersionSnapshot {
  return {
    title: data.title,
    content: data.content,
    excerpt: data.excerpt ?? '',
    tags: data.tags,
  }
}

function parseTags(input: string): string[] {
  return input.split(',').map((t) => t.trim()).filter(Boolean)
}

function resolveExcerpt(content: string, excerpt: string, excerptManual: boolean): string {
  if (excerptManual) return excerpt
  if (excerpt.trim()) return excerpt.trim()
  return getExcerpt(content, 160)
}

function buildPostData(fields: {
  title: string
  content: string
  tagsInput: string
  excerpt: string
  excerptManual: boolean
  slug: string
  type: PostType
  status: PostStatus
  pinned: boolean
  coverImageUrl: string
  seoTitle: string
  seoDescription: string
  ogImageUrl: string
  references: PostReference[]
  projectDemoUrl: string
  projectRepoUrl: string
  projectTechStack: string
  seriesId: string | null
  seriesIndex: number | null
  seriesLabel: string
  seriesRole: SeriesRole | null
  scheduledPublishAt: string
  animation: PostAnimationSettings
}): PostInput {
  const scheduled = fields.scheduledPublishAt ? new Date(fields.scheduledPublishAt) : null
  let status = fields.status
  if (scheduled && scheduled.getTime() > Date.now()) {
    status = 'scheduled'
  }

  return {
    title: fields.title,
    content: fields.content,
    excerpt: resolveExcerpt(fields.content, fields.excerpt, fields.excerptManual),
    slug: fields.slug || undefined,
    tags: parseTags(fields.tagsInput),
    type: fields.type,
    status,
    pinned: fields.pinned,
    coverImageUrl: fields.coverImageUrl,
    seoTitle: fields.seoTitle || fields.title,
    seoDescription: fields.seoDescription || resolveExcerpt(fields.content, fields.excerpt, fields.excerptManual),
    ogImageUrl: fields.ogImageUrl || fields.coverImageUrl,
    references: fields.references,
    projectDemoUrl: fields.projectDemoUrl,
    projectRepoUrl: fields.projectRepoUrl,
    projectTechStack: parseTags(fields.projectTechStack),
    seriesId: fields.seriesId,
    seriesIndex: fields.seriesIndex,
    seriesLabel: fields.seriesLabel,
    seriesRole: fields.seriesRole,
    scheduledPublishAt: scheduled,
    animation: fields.animation,
  }
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [excerptManual, setExcerptManual] = useState(false)
  const [slug, setSlug] = useState('')
  const [type, setType] = useState<PostType>('article')
  const [status, setStatus] = useState<PostStatus>('draft')
  const [pinned, setPinned] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [ogImageUrl, setOgImageUrl] = useState('')
  const [references, setReferences] = useState<PostReference[]>([])
  const [projectDemoUrl, setProjectDemoUrl] = useState('')
  const [projectRepoUrl, setProjectRepoUrl] = useState('')
  const [projectTechStack, setProjectTechStack] = useState('')
  const [seriesId, setSeriesId] = useState<string | null>(null)
  const [seriesIndex, setSeriesIndex] = useState<number | null>(null)
  const [seriesLabel, setSeriesLabel] = useState('')
  const [seriesRole, setSeriesRole] = useState<SeriesRole | null>(null)
  const [seriesTitle, setSeriesTitle] = useState<string | null>(null)
  const [scheduledPublishAt, setScheduledPublishAt] = useState('')
  const [animation, setAnimation] = useState<PostAnimationSettings>({ ...DEFAULT_POST_ANIMATION })
  const [showSeo, setShowSeo] = useState(false)

  const [postId, setPostId] = useState<string | null>(isNew ? null : id ?? null)
  const postRefsPanelRef = useRef<HTMLDivElement>(null)
  const skipLoadForPostIdRef = useRef<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [error, setError] = useState('')
  const [mediaWarning, setMediaWarning] = useState('')

  const fieldsRef = useRef({
    title, tagsInput, content, excerpt, excerptManual, slug, type, status, pinned,
    coverImageUrl, seoTitle, seoDescription, ogImageUrl, references,
    projectDemoUrl, projectRepoUrl, projectTechStack, seriesId, seriesIndex, seriesLabel, seriesRole, scheduledPublishAt, animation,
  })
  fieldsRef.current = {
    title, tagsInput, content, excerpt, excerptManual, slug, type, status, pinned,
    coverImageUrl, seoTitle, seoDescription, ogImageUrl, references,
    projectDemoUrl, projectRepoUrl, projectTechStack, seriesId, seriesIndex, seriesLabel, seriesRole, scheduledPublishAt, animation,
  }
  const postIdRef = useRef(postId)
  postIdRef.current = postId
  const lastVersionFingerprintRef = useRef<string | null>(null)
  const saveExitSnapshotRef = useRef<() => void>(() => {})

  const saveVersionSnapshot = useCallback(async (currentId: string, data: PostInput, force = false) => {
    const snapshot = toVersionSnapshot(data)
    const fingerprint = versionFingerprint(snapshot)
    if (!force && fingerprint === lastVersionFingerprintRef.current) return
    await savePostVersion(currentId, snapshot)
    lastVersionFingerprintRef.current = fingerprint
  }, [])

  saveExitSnapshotRef.current = () => {
    const currentId = postIdRef.current
    if (!currentId) return
    const data = buildPostData({ ...fieldsRef.current, status: fieldsRef.current.status })
    void saveVersionSnapshot(currentId, data).catch(() => {})
  }

  const applyPost = useCallback((post: Post) => {
    setTitle(post.title)
    setTagsInput(post.tags.join(', '))
    setContent(post.content)
    setExcerpt(post.excerpt)
    const autoExcerpt = getExcerpt(post.content, 160)
    if (post.excerpt === '') {
      setExcerptManual(true)
    } else if (post.excerpt && post.excerpt !== autoExcerpt) {
      setExcerptManual(true)
    } else {
      setExcerptManual(false)
    }
    setSlug(post.slug)
    setType(post.type)
    setStatus(post.status)
    setPinned(post.pinned)
    setCoverImageUrl(post.coverImageUrl)
    setSeoTitle(post.seoTitle)
    setSeoDescription(post.seoDescription)
    setOgImageUrl(post.ogImageUrl)
    setReferences(post.references)
    setProjectDemoUrl(post.projectDemoUrl)
    setProjectRepoUrl(post.projectRepoUrl)
    setProjectTechStack(post.projectTechStack.join(', '))
    setSeriesId(post.seriesId)
    setSeriesIndex(post.seriesIndex)
    setSeriesLabel(post.seriesLabel)
    setSeriesRole(post.seriesRole)
    setScheduledPublishAt(post.scheduledPublishAt ? post.scheduledPublishAt.toISOString().slice(0, 16) : '')
    setAnimation(post.animation)
    setPostId(post.id)
    setLastSavedAt(post.updatedAt)
    setMediaWarning(
      contentHasBrokenMediaUrls(post.content)
        ? 'Some media uses temporary URLs that no longer work for readers. Remove and re-add affected gallery photos or videos, then save.'
        : '',
    )
  }, [])

  const markSkipLoad = useCallback((pid: string) => {
    skipLoadForPostIdRef.current = pid
  }, [])

  useEffect(() => {
    if (!isNew) return
    if (searchParams.get('fromAdmin') !== '1') return
    const querySeriesId = searchParams.get('seriesId') ?? searchParams.get('projectId')
    if (!querySeriesId) return
    setSeriesId(querySeriesId)
    getPostsBySeriesId(querySeriesId)
      .then((siblings) => {
        const maxIndex = siblings.reduce((max, p) => Math.max(max, p.seriesIndex ?? 0), 0)
        setSeriesIndex(maxIndex + 1)
        setSeriesRole('devlog')
      })
      .catch(() => {
        setSeriesIndex(1)
        setSeriesRole('devlog')
      })
  }, [isNew, searchParams])

  useEffect(() => {
    if (!seriesId) {
      setSeriesTitle(null)
      return
    }
    getSeries(seriesId)
      .then((item) => setSeriesTitle(item?.title ?? null))
      .catch(() => setSeriesTitle(null))
  }, [seriesId])

  useEffect(() => {
    const scrollToPostPicker = () => {
      postRefsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    window.addEventListener('editor:pick-post-link', scrollToPostPicker)
    return () => window.removeEventListener('editor:pick-post-link', scrollToPostPicker)
  }, [])

  useEffect(() => {
    if (isNew) return
    if (skipLoadForPostIdRef.current === id) {
      skipLoadForPostIdRef.current = null
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    getPostForEdit(id!)
      .then((post) => {
        if (!post) {
          setError('Post not found.')
          return
        }
        applyPost(post)
        lastVersionFingerprintRef.current = versionFingerprint(toVersionSnapshot({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          tags: post.tags,
          status: post.status,
        }))
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load post.'))
      .finally(() => setLoading(false))
  }, [id, isNew, applyPost])

  const ensurePostId = useCallback(async (): Promise<string> => {
    if (postIdRef.current) return postIdRef.current
    const data = buildPostData({ ...fieldsRef.current, status: 'draft' })
    const newId = await createPost(data)
    setPostId(newId)
    postIdRef.current = newId
    markSkipLoad(newId)
    setLastSavedAt(new Date())
    navigate(`/editor/${newId}`, { replace: true })
    return newId
  }, [navigate, markSkipLoad])

  const saveDraft = useCallback(async (options: { silent?: boolean; snapshot?: boolean } = {}) => {
    const silent = options.silent ?? false
    const snapshot = options.snapshot ?? !silent
    const data = buildPostData({ ...fieldsRef.current, status: 'draft' })
    setSaving(true)
    if (!silent) setSaveMessage('Saving…')

    try {
      assertNoBlobUrls(data.content)
      let currentId = postIdRef.current
      if (currentId) {
        await updatePost(currentId, data)
        if (snapshot) {
          await saveVersionSnapshot(currentId, data, true)
        }
        setLastSavedAt(new Date())
      } else {
        currentId = await createPost(data)
        setPostId(currentId)
        postIdRef.current = currentId
        markSkipLoad(currentId)
        setLastSavedAt(new Date())
        if (snapshot) {
          await saveVersionSnapshot(currentId, data, true)
        }
        if (!silent) navigate(`/editor/${currentId}`, { replace: true })
      }
      setStatus(data.status === 'scheduled' ? 'scheduled' : 'draft')
      setSaveMessage('Draft saved')
      setLastSavedAt(new Date())
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (err) {
      setSaveMessage('')
      if (!silent) setError(err instanceof Error ? err.message : 'Failed to save draft.')
    } finally {
      setSaving(false)
    }
  }, [navigate, markSkipLoad, saveVersionSnapshot])

  useEffect(() => {
    const interval = setInterval(() => {
      if (titleRef.current || contentRef.current) saveDraft({ silent: true, snapshot: false })
    }, AUTOSAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [saveDraft])

  useEffect(() => {
    const onPageHide = () => saveExitSnapshotRef.current()
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      saveExitSnapshotRef.current()
    }
  }, [])

  useEffect(() => {
    if (mediaWarning && !contentHasBrokenMediaUrls(content)) {
      setMediaWarning('')
    }
  }, [content, mediaWarning])

  const titleRef = useRef(title)
  const contentRef = useRef(content)
  titleRef.current = title
  contentRef.current = content

  const syncExcerpt = (next: { excerpt?: string; excerptManual?: boolean }) => {
    if (next.excerpt !== undefined) setExcerpt(next.excerpt)
    if (next.excerptManual !== undefined) setExcerptManual(next.excerptManual)
    fieldsRef.current = {
      ...fieldsRef.current,
      excerpt: next.excerpt ?? fieldsRef.current.excerpt,
      excerptManual: next.excerptManual ?? fieldsRef.current.excerptManual,
    }
  }

  const handlePublish = async () => {
    setError('')
    const data = buildPostData({ ...fieldsRef.current, status: 'published', scheduledPublishAt: '' })
    setSaving(true)
    setSaveMessage('Publishing…')
    try {
      assertNoBlobUrls(data.content)
      if (postId) {
        await updatePost(postId, { ...data, scheduledPublishAt: null })
      } else {
        const newId = await createPost(data)
        setPostId(newId)
      }
      setStatus('published')
      setSaveMessage('Published!')
      setTimeout(() => navigate('/dashboard/posts'), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish.')
      setSaveMessage('')
    } finally {
      setSaving(false)
    }
  }

  const handleSchedule = async () => {
    if (!scheduledPublishAt) {
      setError('Pick a date and time to schedule.')
      return
    }
    const data = buildPostData(fieldsRef.current)
    setSaving(true)
    try {
      assertNoBlobUrls(data.content)
      if (postId) await updatePost(postId, data)
      else {
        const newId = await createPost(data)
        setPostId(newId)
        markSkipLoad(newId)
        navigate(`/editor/${newId}`, { replace: true })
      }
      setStatus('scheduled')
      setSaveMessage('Scheduled!')
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const pid = await ensurePostId()
    return uploadEditorImage(pid, file)
  }

  const handleVideoUpload = async (file: File): Promise<string> => {
    const pid = await ensurePostId()
    return uploadEditorVideo(pid, file)
  }

  const handleInsertPostLink = (post: { id: string; title: string; slug: string }) => {
    window.dispatchEvent(
      new CustomEvent('editor:insert-post-link', {
        detail: { postId: post.id, slug: post.slug, title: post.title },
      }),
    )
  }

  const handleCoverUpload = async (file: File) => {
    try {
      const pid = await ensurePostId()
      const url = await uploadPostCover(pid, file)
      setCoverImageUrl(url)
      if (!ogImageUrl) setOgImageUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cover upload failed.')
    }
  }

  const handleReloadCurrent = async () => {
    if (!postId) return
    if (!window.confirm('Reload the current saved version from the server? Unsaved editor changes will be lost.')) return
    setError('')
    setLoading(true)
    try {
      const post = await getPostForEdit(postId)
      if (!post) {
        setError('Post not found on the server.')
        return
      }
      applyPost(post)
      setSaveMessage('Reloaded current saved version')
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reload post.')
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreVersion = (version: PostVersion) => {
    if (
      !window.confirm(
        `Restore snapshot from ${version.createdAt.toLocaleString()}?\n\nThis only updates the editor. Click Save to write it to the live post, or use "Reload current" to discard.`,
      )
    ) {
      return
    }
    setTitle(version.title)
    setContent(version.content)
    setExcerpt(version.excerpt)
    setTagsInput(version.tags.join(', '))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <p className="text-neutral-500">Loading editor…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6">
          <Link to="/dashboard" className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-black">
            <span className="text-lg leading-none">←</span>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-3">
            {saveMessage && <span className="hidden text-xs text-neutral-400 sm:inline">{saveMessage}</span>}
            {status !== 'draft' && (
              <span className="hidden rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-700 sm:inline">
                {status}
              </span>
            )}
            <button type="button" onClick={() => saveDraft({ silent: false, snapshot: true })} disabled={saving} className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 sm:px-4 sm:text-sm">
              Save
            </button>
            <button type="button" onClick={handleSchedule} disabled={saving || !scheduledPublishAt} className="hidden rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 sm:inline-block">
              Schedule
            </button>
            <button type="button" onClick={handlePublish} disabled={saving} className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 sm:px-4 sm:text-sm">
              Publish
            </button>
          </div>
        </div>
      </header>

      <main className="editor-page-main mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
        <div className="editor-page-main__content">
          {error && (
            <div className="mb-4">
              <FirestoreSetupBanner message={error} />
            </div>
          )}
          {mediaWarning && (
            <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              {mediaWarning}
            </div>
          )}

          <div className="mb-4 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (!slug || slug === slugify(title)) setSlug(slugify(e.target.value))
              }}
              placeholder="Title"
              className="w-full border-0 bg-transparent text-[1.65rem] font-normal text-black placeholder-neutral-400 focus:outline-none sm:text-[2.25rem] leading-tight tracking-tight"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags (comma-separated)"
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-neutral-500 placeholder-neutral-400 focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-3">
              <select value={type} onChange={(e) => setType(e.target.value as PostType)} className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm">
                <option value="article">Article</option>
                <option value="project">Project</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                Pin to top
              </label>
              </div>
            </div>
            <ExcerptField
              value={excerpt}
              content={content}
              manual={excerptManual}
              onChange={(value) => syncExcerpt({ excerpt: value, excerptManual: true })}
              onAutoFill={() => syncExcerpt({ excerpt: getExcerpt(content, 160), excerptManual: false })}
              onClear={() => syncExcerpt({ excerpt: '', excerptManual: true })}
            />
          </div>

          <Editor
            content={content}
            onChange={setContent}
            postId={postId}
            references={references}
            onSave={() => saveDraft({ silent: false, snapshot: true })}
            onImageUpload={handleImageUpload}
            onVideoUpload={handleVideoUpload}
          />
        </div>

        <div className="editor-page-main__divider" aria-hidden="true" />

        <aside className="editor-page-main__aside space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <label className="block text-sm font-semibold text-neutral-900">URL slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="my-post-title"
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-neutral-400 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <label className="block text-sm font-semibold text-neutral-900">Schedule publish</label>
            <input
              type="datetime-local"
              value={scheduledPublishAt}
              onChange={(e) => setScheduledPublishAt(e.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-neutral-400 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <label className="block text-sm font-semibold text-neutral-900">Cover image</label>
            {coverImageUrl && (
              <img src={coverImageUrl} alt="" className="mt-2 w-full rounded-lg object-cover" />
            )}
            <input
              type="file"
              accept="image/*"
              className="mt-2 w-full text-xs"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleCoverUpload(file)
              }}
            />
          </div>

          {seriesId && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              <p className="font-semibold text-neutral-900">Series membership</p>
              <p className="mt-1">
                {seriesTitle ? `"${seriesTitle}"` : 'Assigned to a series'}
                {seriesIndex != null ? ` · Part ${seriesIndex}` : ''}
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                Add, remove, or reorder posts in a series from{' '}
                <Link to="/dashboard/series" className="font-medium text-neutral-700 underline">
                  Dashboard → Series
                </Link>
                .
              </p>
            </div>
          )}

          {type === 'project' && !seriesId && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
              <p className="text-sm font-semibold text-neutral-900">Project details</p>
              <input type="url" value={projectDemoUrl} onChange={(e) => setProjectDemoUrl(e.target.value)} placeholder="Demo URL" className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none" />
              <input type="url" value={projectRepoUrl} onChange={(e) => setProjectRepoUrl(e.target.value)} placeholder="Repo URL" className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none" />
              <input type="text" value={projectTechStack} onChange={(e) => setProjectTechStack(e.target.value)} placeholder="Tech stack (comma-separated)" className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none" />
            </div>
          )}

          <div ref={postRefsPanelRef}>
            <PostReferencesPanel
              currentPostId={postId}
              references={references}
              onChange={setReferences}
              onInsertInline={handleInsertPostLink}
            />
          </div>

          <MediaReferencesPanel
            references={references}
            onChange={setReferences}
            postId={postId}
            onEnsurePostId={ensurePostId}
          />

          <AnimationSettingsPanel value={animation} onChange={setAnimation} />

          <div className="rounded-xl border border-neutral-200 bg-white">
            <button type="button" onClick={() => setShowSeo(!showSeo)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-900">
              SEO & sharing
              <span className="text-neutral-400">{showSeo ? '▲' : '▼'}</span>
            </button>
            {showSeo && (
              <div className="space-y-3 border-t border-neutral-100 px-4 py-3">
                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO title" className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none" />
                <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Meta description (for LinkedIn, Google)" rows={3} className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none" />
                <input type="url" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} placeholder="OG image URL" className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none" />
              </div>
            )}
          </div>

          <VersionHistoryPanel
            postId={postId}
            currentSavedAt={lastSavedAt}
            onRestore={handleRestoreVersion}
            onReloadCurrent={handleReloadCurrent}
          />
        </aside>
      </main>
    </div>
  )
}
