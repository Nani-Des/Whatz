export interface Profile {
  name: string
  headline: string
  bio: string
  avatarUrl: string
  location: string
  linkedin: string
  github: string
  email: string
  googleScholar: string
  username: string
  contactCtaText: string
  showContactCta: boolean
  updatedAt: Date
}

export type ProfileInput = Omit<Profile, 'updatedAt'>

export const DEFAULT_PROFILE: ProfileInput = {
  name: 'Desmond Nani',
  headline: 'Engineer · Builder · Storyteller',
  bio: 'I document projects, learnings, and technical deep-dives. Welcome to my portfolio blog.',
  avatarUrl: '',
  location: '',
  linkedin: '',
  github: '',
  email: 'nanidesmond01@gmail.com',
  googleScholar: '',
  username: 'desmond',
  contactCtaText: 'Get in touch',
  showContactCta: true,
}
