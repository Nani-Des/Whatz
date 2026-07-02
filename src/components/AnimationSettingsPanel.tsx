import type { AnimationPreset, PostAnimationSettings } from '../types/postAnimation'
import { PRESET_LABELS, presetSettings } from '../types/postAnimation'

interface AnimationSettingsPanelProps {
  value: PostAnimationSettings
  onChange: (next: PostAnimationSettings) => void
}

const PRESETS: AnimationPreset[] = ['none', 'subtle', 'editorial', 'dynamic', 'custom']

const TOGGLES: { key: keyof Omit<PostAnimationSettings, 'preset'>; label: string; hint: string }[] = [
  { key: 'heroEntrance', label: 'Hero entrance', hint: 'Title and excerpt fade up on load' },
  { key: 'scrollReveal', label: 'Scroll reveal', hint: 'Content blocks animate in while reading' },
  { key: 'staggerContent', label: 'Stagger content', hint: 'Cascade delay between paragraphs' },
  { key: 'coverKenBurns', label: 'Cover drift', hint: 'Slow zoom on cover image' },
  { key: 'ambientBackground', label: 'Ambient background', hint: 'Soft moving grey gradients' },
  { key: 'revealReferences', label: 'References reveal', hint: 'Animate the references section' },
]

export default function AnimationSettingsPanel({ value, onChange }: AnimationSettingsPanelProps) {
  const setPreset = (preset: AnimationPreset) => {
    if (preset === 'custom') {
      onChange({ ...value, preset: 'custom' })
      return
    }
    onChange({ preset, ...presetSettings(preset) })
  }

  const setToggle = (key: keyof Omit<PostAnimationSettings, 'preset'>, checked: boolean) => {
    onChange({
      ...value,
      preset: 'custom',
      [key]: checked,
    })
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-neutral-900">Page motion</h3>
      <p className="mt-1 text-xs text-neutral-500">
        Customize how this post feels when published. Respects reduced-motion preferences.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PRESETS.map((preset) => {
          const active = value.preset === preset
          return (
            <button
              key={preset}
              type="button"
              onClick={() => setPreset(preset)}
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                active
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:border-neutral-400'
              }`}
            >
              <span className="block text-xs font-semibold">{PRESET_LABELS[preset].title}</span>
              <span className={`mt-0.5 block text-[10px] leading-snug ${active ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {PRESET_LABELS[preset].description}
              </span>
            </button>
          )
        })}
      </div>

      {(value.preset === 'custom' || value.preset === 'editorial' || value.preset === 'dynamic') && (
        <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
          {TOGGLES.map(({ key, label, hint }) => (
            <li key={key}>
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={value[key]}
                  onChange={(e) => setToggle(key, e.target.checked)}
                  disabled={value.preset !== 'custom'}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-xs font-medium text-neutral-800">{label}</span>
                  <span className="block text-[10px] text-neutral-500">{hint}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {value.preset !== 'custom' && value.preset !== 'none' && (
        <button
          type="button"
          onClick={() => onChange({ ...value, preset: 'custom' })}
          className="mt-3 text-xs font-medium text-neutral-600 underline underline-offset-2 hover:text-black"
        >
          Fine-tune individual effects →
        </button>
      )}
    </div>
  )
}
