import type { Profile } from '../types/profile'

interface ContactCTAProps {
  profile: Profile
}

export default function ContactCTA({ profile }: ContactCTAProps) {
  if (!profile.showContactCta || !profile.email) return null

  return (
    <section className="mt-16 rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center sm:p-10">
      <h2 className="text-2xl font-semibold text-white">{profile.contactCtaText || 'Get in touch'}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400">
        Interested in working together? I&apos;d love to hear from you.
      </p>
      <a
        href={`mailto:${profile.email}`}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
      >
        Email {profile.name.split(' ')[0]}
        <span aria-hidden="true">→</span>
      </a>
    </section>
  )
}
