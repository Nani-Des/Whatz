import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { publishDueScheduledPosts } from './services/posts'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import PortfolioPage from './pages/PortfolioPage'
import PostView from './pages/PostView'
import AdminLogin from './pages/AdminLogin'
import EditorPage from './pages/EditorPage'
import AdminOverview from './pages/admin/AdminOverview'
import AdminPosts from './pages/admin/AdminPosts'
import AdminProfileSettings from './pages/admin/AdminProfile'
import AdminFeedback from './pages/admin/AdminFeedback'
import AdminSeries from './pages/admin/AdminSeries'
import AdminSeriesEditor from './pages/admin/AdminSeriesEditor'
import SeriesHubPage from './pages/SeriesHubPage'

function LegacyProjectRedirect() {
  const { slug } = useParams<{ slug: string }>()
  return <Navigate to={slug ? `/series/${slug}` : '/'} replace />
}

function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    const unsubscribe = init()
    return unsubscribe
  }, [init])

  useEffect(() => {
    publishDueScheduledPosts().catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/p/:username" element={<PortfolioPage />} />
        <Route path="/series/:slug" element={<SeriesHubPage />} />
        <Route path="/projects/:slug" element={<LegacyProjectRedirect />} />
        <Route path="/post/:id" element={<PostView />} />
        <Route path="/post/s/:slug" element={<PostView />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<PrivateRoute><AdminOverview /></PrivateRoute>} />
        <Route path="/dashboard/posts" element={<PrivateRoute><AdminPosts /></PrivateRoute>} />
        <Route path="/dashboard/profile" element={<PrivateRoute><AdminProfileSettings /></PrivateRoute>} />
        <Route path="/dashboard/feedback" element={<PrivateRoute><AdminFeedback /></PrivateRoute>} />
        <Route path="/dashboard/series" element={<PrivateRoute><AdminSeries /></PrivateRoute>} />
        <Route path="/dashboard/series/new" element={<PrivateRoute><AdminSeriesEditor /></PrivateRoute>} />
        <Route path="/dashboard/series/:id" element={<PrivateRoute><AdminSeriesEditor /></PrivateRoute>} />
        <Route path="/dashboard/projects" element={<Navigate to="/dashboard/series" replace />} />
        <Route path="/dashboard/projects/*" element={<Navigate to="/dashboard/series" replace />} />
        <Route path="/editor/new" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
        <Route path="/editor/:id" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
