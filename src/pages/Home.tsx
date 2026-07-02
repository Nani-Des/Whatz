import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProfileHero from '../components/ProfileHero'
import PostCard from '../components/PostCard'
import ContactCTA from '../components/ContactCTA'
import FirestoreSetupBanner from '../components/FirestoreSetupBanner'
import { useSEO } from '../hooks/useSEO'
import { getPublishedPosts } from '../services/posts'
import { getProfile } from '../services/profile'
import { recordVisit } from '../services/analytics'
import { DEFAULT_PROFILE } from '../types/profile'
import type { Profile } from '../types/profile'
import type { Post } from '../types/post'

interface HomeProps {
  portfolioUsername?: string
}

export default function Home({ portfolioUsername }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [profile, setProfile] = useState<Profile>({ ...DEFAULT_PROFILE, updatedAt: new Date() })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    recordVisit(portfolioUsername ? `/p/${portfolioUsername}` : '/')
  }, [portfolioUsername])

  useEffect(() => {
    Promise.all([getPublishedPosts(), getProfile()])
      .then(([loadedPosts, loadedProfile]) => {
        if (portfolioUsername && loadedProfile.username !== portfolioUsername) {
          setError('Portfolio not found.')
          return
        }
        setPosts(loadedPosts)
        setProfile(loadedProfile)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load content.'))
      .finally(() => setLoading(false))
  }, [portfolioUsername])

  useSEO({
    title: profile.name,
    description: profile.headline,
    image: profile.avatarUrl || undefined,
    type: 'website',
  })

  const pinned = posts.filter((p) => p.pinned)
  const projects = posts.filter((p) => p.type === 'project' && !p.pinned)
  const articles = posts.filter((p) => p.type !== 'project' && !p.pinned)

  const portfolioUrl = `${window.location.origin}/p/${profile.username}`

  const copyPortfolioLink = async () => {
    await navigator.clipboard.writeText(portfolioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">Whatz</Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyPortfolioLink}
              className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white sm:px-4"
            >
              {copied ? 'Copied!' : 'Share link'}
            </button>
            <Link to="/admin" className="rounded-full border border-neutral-700 px-4 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <ProfileHero profile={profile} portfolioUrl={portfolioUrl} />

        {loading && (
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-neutral-900" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8">
            <FirestoreSetupBanner message={error} />
          </div>
        )}

        {!loading && !error && (
          <>
            {pinned.length > 0 && (
              <section className="mt-16">
                <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">Pinned</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {pinned.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {projects.length > 0 && (
              <section className="mt-16">
                <div className="mb-8">
                  <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">Projects</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Selected work</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {projects.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            <section className="mt-16">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">Writing</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Latest articles</h2>
                </div>
                <p className="hidden text-sm text-neutral-500 sm:block">
                  {articles.length} published {articles.length === 1 ? 'article' : 'articles'}
                </p>
              </div>

              {articles.length === 0 && projects.length === 0 && pinned.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
                  <p className="text-neutral-500">No published content yet.</p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                {articles.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>

            <ContactCTA profile={profile} />
          </>
        )}
      </main>
    </div>
  )
}
