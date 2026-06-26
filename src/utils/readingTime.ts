export function getWordCount(text: string): number {
  const stripped = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!stripped) return 0
  return stripped.split(' ').length
}

export function getReadingTime(text: string): number {
  const words = getWordCount(text)
  return Math.max(1, Math.ceil(words / 200))
}
