import type { CloudinaryUploadResponse } from '@/types/cloudinaryresponse'
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from './config'
import { getUploadSignature } from './signature'

/**
 * Upload Service
 * Single Responsibility: Handle file uploads to Cloudinary
 */

type ResourceType = 'image' | 'video'

/**
 * Determine resource type from file
 */
function getResourceType(file: File): ResourceType {
  return file.type.startsWith('video/') ? 'video' : 'image'
}

/**
 * Build upload URL for specific resource type
 */
function buildUploadUrl(resourceType: ResourceType): string {
  return `${CLOUDINARY_CONFIG.baseUrl}/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`
}

/**
 * Create FormData for signed upload
 */
async function createUploadFormData(file: File): Promise<FormData> {
  const timestamp = Math.round(Date.now() / 1000)
  const { signature } = await getUploadSignature(timestamp)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)
  formData.append('api_key', CLOUDINARY_CONFIG.apiKey)
  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)

  return formData
}

/**
 * Upload file to Cloudinary with optimizations applied via preset
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  validateCloudinaryConfig()

  const resourceType = getResourceType(file)
  const formData = await createUploadFormData(file)
  const uploadUrl = buildUploadUrl(resourceType)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }))
    throw new Error(error.message || 'Upload failed')
  }

  return response.json()
}
