import { Link } from 'react-router-dom'

interface HeaderProps {
  showAdminLink?: boolean
}

export default function Header({ showAdminLink = true }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-2xl font-bold tracking-tight text-gray-900">
          Whatz
        </Link>
        {showAdminLink && (
          <Link
            to="/admin"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Admin
          </Link>
        )}
      </div>
    </header>
  )
}
