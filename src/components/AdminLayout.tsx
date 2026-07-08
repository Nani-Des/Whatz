import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface AdminLayoutProps {
  children: React.ReactNode
  active: 'overview' | 'posts' | 'series' | 'profile' | 'feedback'
}

const NAV = [
  { id: 'overview' as const, label: 'Overview', path: '/dashboard' },
  { id: 'posts' as const, label: 'Posts', path: '/dashboard/posts' },
  { id: 'series' as const, label: 'Series', path: '/dashboard/series' },
  { id: 'profile' as const, label: 'Profile', path: '/dashboard/profile' },
  { id: 'feedback' as const, label: 'Feedback', path: '/dashboard/feedback' },
]

export default function AdminLayout({ children, active }: AdminLayoutProps) {
  const signOut = useAuthStore((s) => s.signOut)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 p-6 lg:flex">
          <Link to="/" className="text-xl font-semibold tracking-tight text-white">
            Whatz
          </Link>
          <p className="mt-1 text-xs text-neutral-500">Admin console</p>

          <nav className="mt-10 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active === item.id
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3 border-t border-white/10 pt-6">
            <p className="truncate text-xs text-neutral-500">{user?.email}</p>
            <Link
              to="/editor/new"
              className="block rounded-lg bg-white px-3 py-2.5 text-center text-sm font-medium text-black hover:bg-neutral-200 transition-colors"
            >
              + New post
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3 backdrop-blur lg:hidden">
            <Link to="/" className="font-semibold text-white">Whatz Admin</Link>
            <div className="flex gap-2">
              <Link to="/editor/new" className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black">
                New
              </Link>
              <button type="button" onClick={handleSignOut} className="text-xs text-neutral-400">Sign out</button>
            </div>
          </header>

          <div className="flex gap-1 overflow-x-auto border-b border-neutral-800 px-4 py-2 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                  active === item.id ? 'bg-white text-black' : 'text-neutral-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <main className="flex-1 p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
