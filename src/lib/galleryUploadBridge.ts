import type { UploadedImageUrls, UploadedVideoUrls } from '../types/media'

export type GalleryImageUpload = (file: File) => Promise<string | UploadedImageUrls>
export type GalleryVideoUpload = (file: File) => Promise<string | UploadedVideoUrls>

/** Runtime upload handlers wired by the editor; read by the gallery extension. */
export const galleryUploadBridge = {
  uploadImage: null as GalleryImageUpload | null,
  uploadVideo: null as GalleryVideoUpload | null,
}
