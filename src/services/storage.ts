import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { app } from '../firebase.js'
import type { UploadedImageUrls, UploadedVideoUrls } from '../types/media'
import { generateImageVariants } from '../utils/optimizeImage'
import { captureVideoPoster } from '../utils/videoPoster'

const storage = getStorage(app)

async function uploadPayload(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, { contentType: file.type })
  return getDownloadURL(storageRef)
}

export async function uploadFile(path: string, file: File): Promise<string> {
  return uploadPayload(path, file)
}

async function uploadImageWithVariants(path: string, file: File, cover = false): Promise<UploadedImageUrls> {
  const variants = await generateImageVariants(file, cover)
  if (!variants) {
    const url = await uploadPayload(path, file)
    return { full: url, medium: url, small: url }
  }

  const basePath = path.replace(/\.webp$/i, '')
  const [full, medium, small] = await Promise.all([
    uploadPayload(`${basePath}.webp`, variants.full),
    uploadPayload(`${basePath}-md.webp`, variants.medium),
    uploadPayload(`${basePath}-sm.webp`, variants.small),
  ])

  return { full, medium, small }
}

export async function uploadPostMedia(
  postId: string,
  file: File,
): Promise<{ url: string; fileName: string; mimeType: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  if (file.type.startsWith('image/')) {
    const urls = await uploadImageWithVariants(`posts/${postId}/media/${Date.now()}-${safeName}.webp`, file)
    return { url: urls.full, fileName: file.name, mimeType: 'image/webp' }
  }
  const path = `posts/${postId}/media/${Date.now()}-${safeName}`
  const url = await uploadPayload(path, file)
  return { url, fileName: file.name, mimeType: file.type }
}

export async function uploadPostCover(postId: string, file: File): Promise<UploadedImageUrls> {
  return uploadImageWithVariants(`posts/${postId}/cover.webp`, file, true)
}

export async function uploadSeriesCover(seriesId: string, file: File): Promise<UploadedImageUrls> {
  return uploadImageWithVariants(`series/${seriesId}/cover.webp`, file, true)
}

/** @deprecated Use uploadSeriesCover */
export const uploadProjectCover = uploadSeriesCover

export async function uploadEditorImage(postId: string, file: File): Promise<UploadedImageUrls> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  return uploadImageWithVariants(`posts/${postId}/images/${Date.now()}-${safeName}.webp`, file)
}

export async function uploadEditorVideo(postId: string, file: File): Promise<UploadedVideoUrls> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const stamp = Date.now()
  const videoPath = `posts/${postId}/videos/${stamp}-${safeName}`
  const url = await uploadPayload(videoPath, file)

  const posterFile = await captureVideoPoster(file)
  if (!posterFile) return { url }

  const posterPath = `posts/${postId}/videos/${stamp}-${safeName.replace(/\.[^.]+$/, '')}-poster.webp`
  const poster = await uploadPayload(posterPath, posterFile)
  return { url, poster }
}
