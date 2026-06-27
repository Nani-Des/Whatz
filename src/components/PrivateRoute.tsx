import { Navigate } from 'react-router-dom'
import { useAuthStore, isAdminUser } from '../stores/authStore'

interface PrivateRouteProps {
  children: React.ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-neutral-400">Loading...</div>
      </div>
    )
  }

  if (!user || !isAdminUser(user)) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
