/**
 * Cloudinary Delete Service
 * Single Responsibility: Handle deletion of resources from Cloudinary
 */

import { extractPublicId } from './utils'

interface DeleteResponse {
  result: string
  error?: string
}

/**
 * Delete a resource from Cloudinary via server API
 * @param url - The Cloudinary URL or public_id to delete
 * @param resourceType - Type of resource ('image' or 'video')
 * @returns Promise with deletion result
 */
export async function deleteFromCloudinary(
  url: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<DeleteResponse> {
  try {
    const publicId = url.includes('cloudinary.com') 
      ? extractPublicId(url) 
      : url

    if (!publicId) {
      throw new Error('Invalid Cloudinary URL or public_id')
    }

    // Call our server API to delete from Cloudinary
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId, resourceType }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete from Cloudinary')
    }

    return { result: result.result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error deleting from Cloudinary:', message)
    return { result: 'error', error: message }
  }
}
