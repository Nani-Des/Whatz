import { useEffect, useState } from 'react'
import Header from '../components/Header'
import PostCard from '../components/PostCard'
import { getPublishedPosts } from '../services/posts'
import type { Post } from '../types/post'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublishedPosts()
      .then(setPosts)
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Latest Posts</h1>

        {loading && (
          <p className="text-gray-500">Loading posts...</p>
        )}

        {error && (
          <p className="text-red-600">{error}</p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-gray-500">No published posts yet. Check back soon!</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  )
}
