/**
 * Storage Service
 * Single Responsibility: Handle file storage operations in Supabase
 * Open/Closed Principle: Easy to extend with new storage providers
 */

import { createClient } from '@/utils/supabase/client'
import type { MediaType } from '@/types/memory'

interface UploadOptions {
  fileName: string
  blob: Blob
  contentType: string
}

interface UploadResult {
  publicUrl: string
  path: string
}

const BUCKET_NAME = 'memories'

/**
 * Upload file to Supabase Storage
 */
export async function uploadToStorage({
  fileName,
  blob,
  contentType,
}: UploadOptions): Promise<UploadResult> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, {
      contentType,
      upsert: false,
    })

  if (error) {
    throw new Error(`Error uploading to storage: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

  return { publicUrl, path: data.path }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromStorage(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

  if (error) {
    throw new Error(`Error deleting from storage: ${error.message}`)
  }
}

/**
 * Generate unique filename for storage
 */
export function generateFileName(publicId: string, mediaType: MediaType): string {
  const extension = mediaType === 'image' ? 'jpg' : 'mp4'
  const timestamp = Date.now()
  return `${publicId}-${timestamp}.${extension}`
}
