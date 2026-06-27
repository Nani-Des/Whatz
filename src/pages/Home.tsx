import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProfileHero from '../components/ProfileHero'
import PostCard from '../components/PostCard'
import FirestoreSetupBanner from '../components/FirestoreSetupBanner'
import { getPublishedPosts } from '../services/posts'
import { getProfile } from '../services/profile'
import { recordVisit } from '../services/analytics'
import { DEFAULT_PROFILE } from '../types/profile'
import type { Profile } from '../types/profile'
import type { Post } from '../types/post'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [profile, setProfile] = useState<Profile>({ ...DEFAULT_PROFILE, updatedAt: new Date() })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    recordVisit('/')
  }, [])

  useEffect(() => {
    Promise.all([getPublishedPosts(), getProfile()])
      .then(([loadedPosts, loadedProfile]) => {
        setPosts(loadedPosts)
        setProfile(loadedProfile)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load content.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">Whatz</Link>
          <Link
            to="/admin"
            className="rounded-full border border-neutral-700 px-4 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <ProfileHero profile={profile} />

        <section className="mt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">Writing</p>
              <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Latest work & learnings</h2>
            </div>
            <p className="hidden text-sm text-neutral-500 sm:block">
              {posts.length} published {posts.length === 1 ? 'article' : 'articles'}
            </p>
          </div>

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-neutral-900" />
              ))}
            </div>
          )}

          {error && (
            <div className="mb-6">
              <FirestoreSetupBanner message={error} />
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
              <p className="text-neutral-500">No published articles yet.</p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
