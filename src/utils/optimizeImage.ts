export interface OptimizeImageOptions {
  maxDimension?: number
  quality?: number
  skipUnderBytes?: number
}

export interface ImageVariantFiles {
  full: File
  medium: File
  small: File
}

const VARIANT_PRESETS = {
  inline: {
    full: { maxDimension: 1920, quality: 0.88 },
    medium: { maxDimension: 960, quality: 0.85 },
    small: { maxDimension: 480, quality: 0.82 },
  },
  cover: {
    full: { maxDimension: 2400, quality: 0.9 },
    medium: { maxDimension: 1200, quality: 0.87 },
    small: { maxDimension: 640, quality: 0.84 },
  },
} as const

function isOptimizableImage(file: File): boolean {
  if (!file.type.startsWith('image/')) return false
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return false
  return true
}

async function renderImageVariant(
  file: File,
  { maxDimension, quality }: Required<Pick<OptimizeImageOptions, 'maxDimension' | 'quality'>>,
  label: string,
): Promise<File> {
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

  if (!blob) return file

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${baseName}${label}.webp`, { type: 'image/webp', lastModified: file.lastModified })
}

/** Produce full / medium / small WebP variants for faster, right-sized delivery. */
export async function generateImageVariants(file: File, cover = false): Promise<ImageVariantFiles | null> {
  if (!isOptimizableImage(file)) return null
  const preset = cover ? VARIANT_PRESETS.cover : VARIANT_PRESETS.inline

  const [full, medium, small] = await Promise.all([
    renderImageVariant(file, preset.full, ''),
    renderImageVariant(file, preset.medium, '-md'),
    renderImageVariant(file, preset.small, '-sm'),
  ])

  return { full, medium, small }
}

/** Backward-compatible single-file optimization for non-variant uploads. */
export async function optimizeImageForUpload(
  file: File,
  options: OptimizeImageOptions = {},
): Promise<File> {
  const cover = options.maxDimension != null && options.maxDimension >= 2400
  const variants = await generateImageVariants(file, cover)
  return variants?.full ?? file
}
