/**
 * Cloudinary configuration
 * Single Responsibility: Manage configuration values
 */
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  baseUrl: 'https://api.cloudinary.com/v1_1',
  cdnUrl: 'https://res.cloudinary.com',
} as const

/**
 * Validate required environment variables
 */
export function validateCloudinaryConfig(): void {
  const required = ['cloudName', 'uploadPreset', 'apiKey'] as const
  
  for (const key of required) {
    if (!CLOUDINARY_CONFIG[key]) {
      throw new Error(`NEXT_PUBLIC_CLOUDINARY_${key.toUpperCase()} is not defined`)
    }
  }
}
