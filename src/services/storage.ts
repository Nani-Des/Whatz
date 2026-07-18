import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { app } from '../firebase.js'
import { optimizeImageForUpload } from '../utils/optimizeImage'

const storage = getStorage(app)

export async function uploadFile(
  path: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  void onProgress
  const payload = file.type.startsWith('image/')
    ? await optimizeImageForUpload(file, path.includes('/cover.') ? { maxDimension: 2400, quality: 0.85 } : undefined)
    : file

  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, payload, { contentType: payload.type })
  return getDownloadURL(storageRef)
}

export async function uploadPostMedia(postId: string, file: File): Promise<{ url: string; fileName: string; mimeType: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `posts/${postId}/media/${Date.now()}-${safeName}`
  const url = await uploadFile(path, file)
  return { url, fileName: file.name, mimeType: file.type }
}

export async function uploadPostCover(postId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `posts/${postId}/cover.${ext}`
  return uploadFile(path, file)
}

export async function uploadSeriesCover(seriesId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `series/${seriesId}/cover.${ext}`
  return uploadFile(path, file)
}

/** @deprecated Use uploadSeriesCover */
export const uploadProjectCover = uploadSeriesCover

export async function uploadEditorImage(postId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `posts/${postId}/images/${Date.now()}-${safeName}`
  return uploadFile(path, file)
}

export async function uploadEditorVideo(postId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `posts/${postId}/videos/${Date.now()}-${safeName}`
  return uploadFile(path, file)
}
