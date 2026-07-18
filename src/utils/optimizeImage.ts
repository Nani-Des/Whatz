export interface OptimizeImageOptions {
  maxDimension?: number
  quality?: number
  skipUnderBytes?: number
}

const DEFAULTS: Required<OptimizeImageOptions> = {
  maxDimension: 1920,
  quality: 0.82,
  skipUnderBytes: 350_000,
}

function isOptimizableImage(file: File): boolean {
  if (!file.type.startsWith('image/')) return false
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return false
  return true
}

/** Resize and compress photos before upload so readers download smaller files. */
export async function optimizeImageForUpload(
  file: File,
  options: OptimizeImageOptions = {},
): Promise<File> {
  if (!isOptimizableImage(file)) return file

  const { maxDimension, quality, skipUnderBytes } = { ...DEFAULTS, ...options }
  if (file.size < skipUnderBytes) return file

  let bitmap: ImageBitmap | null = null
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  const { width, height } = bitmap
  const scale = Math.min(1, maxDimension / Math.max(width, height))
  const targetWidth = Math.max(1, Math.round(width * scale))
  const targetHeight = Math.max(1, Math.round(height * scale))

  if (scale >= 1 && file.type === 'image/webp' && file.size < skipUnderBytes * 2) {
    bitmap.close()
    return file
  }

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', quality)
  })

  if (!blob || blob.size >= file.size * 0.95) return file

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: file.lastModified })
}
