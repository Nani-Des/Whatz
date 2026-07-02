export type AnimationPreset = 'none' | 'subtle' | 'editorial' | 'dynamic' | 'custom'

export interface PostAnimationSettings {
  preset: AnimationPreset
  heroEntrance: boolean
  scrollReveal: boolean
  staggerContent: boolean
  coverKenBurns: boolean
  ambientBackground: boolean
  revealReferences: boolean
}

export const PRESET_LABELS: Record<AnimationPreset, { title: string; description: string }> = {
  none: { title: 'None', description: 'Static layout, no motion' },
  subtle: { title: 'Subtle', description: 'Gentle fade-ins as you scroll' },
  editorial: { title: 'Editorial', description: 'Hero entrance + scroll reveals + ambient mood' },
  dynamic: { title: 'Dynamic', description: 'Full motion with stagger and cover drift' },
  custom: { title: 'Custom', description: 'Pick exactly what you want' },
}

const PRESET_VALUES: Record<Exclude<AnimationPreset, 'custom'>, Omit<PostAnimationSettings, 'preset'>> = {
  none: {
    heroEntrance: false,
    scrollReveal: false,
    staggerContent: false,
    coverKenBurns: false,
    ambientBackground: false,
    revealReferences: false,
  },
  subtle: {
    heroEntrance: true,
    scrollReveal: true,
    staggerContent: false,
    coverKenBurns: false,
    ambientBackground: false,
    revealReferences: true,
  },
  editorial: {
    heroEntrance: true,
    scrollReveal: true,
    staggerContent: true,
    coverKenBurns: false,
    ambientBackground: true,
    revealReferences: true,
  },
  dynamic: {
    heroEntrance: true,
    scrollReveal: true,
    staggerContent: true,
    coverKenBurns: true,
    ambientBackground: true,
    revealReferences: true,
  },
}

export const DEFAULT_POST_ANIMATION: PostAnimationSettings = {
  preset: 'editorial',
  ...PRESET_VALUES.editorial,
}

export function presetSettings(preset: AnimationPreset): Omit<PostAnimationSettings, 'preset'> {
  if (preset === 'custom') return { ...PRESET_VALUES.editorial }
  return { ...PRESET_VALUES[preset] }
}

export function resolvePostAnimation(raw: Partial<PostAnimationSettings> | null | undefined): PostAnimationSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_POST_ANIMATION }

  const preset = (['none', 'subtle', 'editorial', 'dynamic', 'custom'] as const).includes(raw.preset as AnimationPreset)
    ? (raw.preset as AnimationPreset)
    : DEFAULT_POST_ANIMATION.preset

  if (preset !== 'custom') {
    return { preset, ...presetSettings(preset) }
  }

  const base = presetSettings('editorial')
  return {
    preset: 'custom',
    heroEntrance: raw.heroEntrance ?? base.heroEntrance,
    scrollReveal: raw.scrollReveal ?? base.scrollReveal,
    staggerContent: raw.staggerContent ?? base.staggerContent,
    coverKenBurns: raw.coverKenBurns ?? base.coverKenBurns,
    ambientBackground: raw.ambientBackground ?? base.ambientBackground,
    revealReferences: raw.revealReferences ?? base.revealReferences,
  }
}

export function mapPostAnimation(raw: unknown): PostAnimationSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_POST_ANIMATION }
  return resolvePostAnimation(raw as Partial<PostAnimationSettings>)
}
