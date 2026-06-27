import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getProfile, updateProfile } from '../../services/profile'
import { DEFAULT_PROFILE, type ProfileInput } from '../../types/profile'

export default function AdminProfileSettings() {
  const [form, setForm] = useState<ProfileInput>(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getProfile()
      .then((p) => setForm({
        name: p.name,
        headline: p.headline,
        bio: p.bio,
        avatarUrl: p.avatarUrl,
        location: p.location,
        linkedin: p.linkedin,
        github: p.github,
        email: p.email,
        googleScholar: p.googleScholar,
      }))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (field: keyof ProfileInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateProfile(form)
      setMessage('Profile saved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const fields: { key: keyof ProfileInput; label: string; placeholder: string; type?: string }[] = [
    { key: 'name', label: 'Full name', placeholder: 'Desmond Nani' },
    { key: 'headline', label: 'Headline', placeholder: 'Engineer · Builder' },
    { key: 'bio', label: 'Bio', placeholder: 'Short introduction for recruiters...' },
    { key: 'location', label: 'Location', placeholder: 'City, Country' },
    { key: 'avatarUrl', label: 'Avatar URL', placeholder: 'https://...' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/...' },
    { key: 'email', label: 'Email', placeholder: 'nanidesmond01@gmail.com', type: 'email' },
    { key: 'googleScholar', label: 'Google Scholar', placeholder: 'https://scholar.google.com/...' },
  ]

  return (
    <AdminLayout active="profile">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Profile</h1>
          <p className="mt-1 text-sm text-neutral-400">Customize your public portfolio page</p>
        </div>
        <Link to="/" className="text-sm text-neutral-300 hover:underline">Preview portfolio →</Link>
      </div>

      {loading && <p className="text-neutral-400">Loading profile...</p>}

      {!loading && (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          {message && <p className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-200">{message}</p>}
          {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

          {fields.map(({ key, label, placeholder, type = 'text' }) => (
            <label key={key} className="block">
              <span className="text-sm font-medium text-neutral-300">{label}</span>
              {key === 'bio' ? (
                <textarea
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={4}
                  placeholder={placeholder}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-neutral-500 focus:outline-none"
                />
              ) : (
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-neutral-500 focus:outline-none"
                />
              )}
            </label>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      )}
    </AdminLayout>
  )
}
