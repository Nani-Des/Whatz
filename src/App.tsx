import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
        <Route path="/post/:id" element={<PostView />} />
        <Route path="/post/s/:slug" element={<PostView />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<PrivateRoute><AdminOverview /></PrivateRoute>} />
        <Route path="/dashboard/posts" element={<PrivateRoute><AdminPosts /></PrivateRoute>} />
        <Route path="/dashboard/profile" element={<PrivateRoute><AdminProfileSettings /></PrivateRoute>} />
        <Route path="/dashboard/feedback" element={<PrivateRoute><AdminFeedback /></PrivateRoute>} />
        <Route path="/editor/new" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
        <Route path="/editor/:id" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
