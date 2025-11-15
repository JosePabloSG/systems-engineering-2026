import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from './config'

/**
 * Transformation Service
 * Single Responsibility: Build transformation URLs
 */

type ResourceType = 'image' | 'video'

interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop' | 'limit' | 'pad'
}

interface VideoTransformOptions {
  width?: number
  quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number
  format?: 'auto' | 'mp4' | 'webm'
}

/**
 * Build transformation string for images
 */
function buildImageTransformations(options: ImageTransformOptions): string {
  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options

  const transformations: string[] = []
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  transformations.push(`c_${crop}`, `q_${quality}`, `f_${format}`)

  return transformations.join(',')
}

/**
 * Build transformation string for videos
 */
function buildVideoTransformations(options: VideoTransformOptions): string {
  const { width, quality = 'auto', format = 'auto' } = options

  const transformations: string[] = []
  if (width) transformations.push(`w_${width}`)
  transformations.push(`q_${quality}`, `f_${format}`)

  return transformations.join(',')
}

/**
 * Build CDN URL with transformations
 */
function buildCdnUrl(resourceType: ResourceType, transformations: string, publicId: string): string {
  return `${CLOUDINARY_CONFIG.cdnUrl}/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload/${transformations}/${publicId}`
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedImageUrl(publicId: string, options: ImageTransformOptions = {}): string {
  validateCloudinaryConfig()
  const transformations = buildImageTransformations(options)
  return buildCdnUrl('image', transformations, publicId)
}

/**
 * Generate optimized video URL with transformations
 */
export function getOptimizedVideoUrl(publicId: string, options: VideoTransformOptions = {}): string {
  validateCloudinaryConfig()
  const transformations = buildVideoTransformations(options)
  return buildCdnUrl('video', transformations, publicId)
}

/**
 * Get responsive image srcset for different screen sizes
 */
export function getResponsiveImageSrcSet(
  publicId: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  validateCloudinaryConfig()

  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(publicId, { width, quality: 'auto', format: 'auto' })
      return `${url} ${width}w`
    })
    .join(', ')
}
