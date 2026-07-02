import type { Profile } from '../types/profile'

interface ProfileHeroProps {
  profile: Profile
  portfolioUrl?: string
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  if (!href) return null
  const url = href.startsWith('http') || href.startsWith('mailto:') ? href : `https://${href}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 transition-all hover:border-neutral-600 hover:bg-neutral-900"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-black text-white transition-colors group-hover:border-neutral-500">
        {icon}
      </span>
      <span className="text-sm font-medium text-neutral-200">{label}</span>
    </a>
  )
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function ProfileHero({ profile, portfolioUrl }: ProfileHeroProps) {
  const socials = [
    {
      key: 'linkedin',
      href: profile.linkedin,
      label: 'LinkedIn',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      key: 'github',
      href: profile.github,
      label: 'GitHub',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      key: 'email',
      href: profile.email ? `mailto:${profile.email}` : '',
      label: 'Email',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'scholar',
      href: profile.googleScholar,
      label: 'Google Scholar',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5s-5.548 1.749-6.758 4.269zM12 10a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
      ),
    },
  ].filter((s) => s.href)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:rounded-3xl sm:p-8 lg:p-12">
      <div className="relative flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-5 lg:gap-6">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-neutral-700 sm:h-24 sm:w-24"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-neutral-700 bg-black text-2xl font-semibold text-white sm:h-24 sm:w-24">
              {initials(profile.name)}
            </div>
          )}
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">Portfolio</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">{profile.name}</h1>
            <p className="mt-2 text-base text-neutral-300 sm:text-lg">{profile.headline}</p>
            {profile.location && (
              <p className="mt-2 text-sm text-neutral-500">{profile.location}</p>
            )}
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-400">{profile.bio}</p>
            {portfolioUrl && (
              <p className="mt-3 text-xs text-neutral-600">
                Portfolio: <span className="text-neutral-400">{portfolioUrl.replace(/^https?:\/\//, '')}</span>
              </p>
            )}
          </div>
        </div>

        {socials.length > 0 && (
          <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-72 lg:grid-cols-1">
            {socials.map((social) => (
              <SocialLink key={social.key} href={social.href} label={social.label} icon={social.icon} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
