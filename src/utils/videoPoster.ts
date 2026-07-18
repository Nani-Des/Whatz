const POSTER_MAX_WIDTH = 1280
const POSTER_QUALITY = 0.84

/** Extract a lightweight WebP poster frame from a video file for faster perceived load. */
export async function captureVideoPoster(file: File): Promise<File | null> {
  if (!file.type.startsWith('video/')) return null

  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'metadata'
  video.src = objectUrl

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Video poster timeout')), 12_000)
      video.onloadeddata = () => {
        window.clearTimeout(timeout)
        resolve()
      }
      video.onerror = () => {
        window.clearTimeout(timeout)
        reject(new Error('Video poster decode failed'))
      }
    })

    const seekTo = Number.isFinite(video.duration) && video.duration > 0
      ? Math.min(0.5, video.duration * 0.08)
      : 0
    video.currentTime = seekTo

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Video seek timeout')), 5000)
      video.onseeked = () => {
        window.clearTimeout(timeout)
        resolve()
      }
      video.onerror = () => {
        window.clearTimeout(timeout)
        reject(new Error('Video seek failed'))
      }
    })

    if (!video.videoWidth || !video.videoHeight) return null

    const scale = Math.min(1, POSTER_MAX_WIDTH / video.videoWidth)
    const width = Math.max(1, Math.round(video.videoWidth * scale))
    const height = Math.max(1, Math.round(video.videoHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', POSTER_QUALITY)
    })
    if (!blob) return null

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'video'
    return new File([blob], `${baseName}-poster.webp`, { type: 'image/webp', lastModified: file.lastModified })
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(objectUrl)
    video.removeAttribute('src')
    video.load()
  }
}
