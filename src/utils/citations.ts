import type { PostReference } from '../types/post'

export function getCitationIndex(references: PostReference[], refId: string): number {
  const idx = references.findIndex((r) => r.id === refId)
  return idx >= 0 ? idx + 1 : 0
}

export function formatCitationLabel(index: number): string {
  return `[${index}]`
}

export function createCitationNumberResolver(references: PostReference[]) {
  return (refId: string): number | null => {
    const index = getCitationIndex(references, refId)
    return index > 0 ? index : null
  }
}
