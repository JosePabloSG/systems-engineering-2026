/**
 * Utility functions for Cloudinary
 * Single Responsibility: Helper functions for URL parsing and validation
 */

/**
 * Extract public_id from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  try {
    const uploadIndex = url.indexOf('/upload/')
    if (uploadIndex === -1) return null

    const afterUpload = url.slice(uploadIndex + 8)
    const withoutVersion = afterUpload.replace(/^v\d+\//, '')
    const pathParts = withoutVersion.split('/')
    const fileNameWithExt = pathParts[pathParts.length - 1]
    const publicId = fileNameWithExt.split('.')[0]

    return publicId || null
  } catch {
    return null
  }
}

/**
 * Validate if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  return url.includes('cloudinary.com') && url.includes('/upload/')
}
