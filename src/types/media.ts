export interface UploadedImageUrls {
  full: string
  medium: string
  small: string
}

export interface UploadedVideoUrls {
  url: string
  poster?: string
}

export function isUploadedImageUrls(value: unknown): value is UploadedImageUrls {
  return (
    typeof value === 'object'
    && value !== null
    && 'full' in value
    && typeof (value as UploadedImageUrls).full === 'string'
  )
}

export function isUploadedVideoUrls(value: unknown): value is UploadedVideoUrls {
  return typeof value === 'object' && value !== null && 'url' in value
}
