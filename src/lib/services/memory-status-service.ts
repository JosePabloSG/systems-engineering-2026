/**
 * Memory Status Service
 * Single Responsibility: Handle memory status updates and related operations
 * Strategy Pattern: Different strategies for approve/reject actions
 */

import { createClient } from '@/utils/supabase/client'
import { deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary'
import {
  uploadToStorage,
  deleteFromStorage,
  generateFileName,
} from './storage-service'
import type { MemoryStatus, MediaType } from '@/types/memory'

interface UpdateStatusParams {
  memoryId: string
  status: MemoryStatus
  cloudinaryUrl: string
  mediaType: MediaType
}

interface UpdateStatusResult {
  memoryId: string
  status: MemoryStatus
  action: string
  newUrl?: string
}

/**
 * Update memory status with appropriate action
 */
export async function updateMemoryStatus({
  memoryId,
  status,
  cloudinaryUrl,
  mediaType,
}: UpdateStatusParams): Promise<UpdateStatusResult> {
  if (status === 'rejected') {
    return handleRejectMemory(memoryId, cloudinaryUrl, mediaType)
  }

  if (status === 'approved') {
    return handleApproveMemory(memoryId, cloudinaryUrl, mediaType)
  }

  return handleDefaultUpdate(memoryId, status)
}

/**
 * Handle memory rejection
 * Delete from Cloudinary and update status
 */
async function handleRejectMemory(
  memoryId: string,
  cloudinaryUrl: string,
  mediaType: MediaType
): Promise<UpdateStatusResult> {
  const supabase = createClient()

  // Delete from Cloudinary
  const deleteResult = await deleteFromCloudinary(cloudinaryUrl, mediaType)
  if (deleteResult.error) {
    console.warn('Failed to delete from Cloudinary:', deleteResult.error)
  }

  // Update status in database
  const { error } = await supabase
    .from('memories')
    .update({ status: 'rejected' })
    .eq('id', memoryId)

  if (error) {
    throw new Error(`Error rejecting memory: ${error.message}`)
  }

  return { memoryId, status: 'rejected', action: 'rejected' }
}

/**
 * Handle memory approval
 * Migrate from Cloudinary to Supabase Storage
 */
async function handleApproveMemory(
  memoryId: string,
  cloudinaryUrl: string,
  mediaType: MediaType
): Promise<UpdateStatusResult> {
  const supabase = createClient()

  try {
    // Download from Cloudinary
    const blob = await downloadFromCloudinary(cloudinaryUrl)

    // Generate filename and upload to Supabase Storage
    const publicId = extractPublicId(cloudinaryUrl) || 'memory'
    const fileName = generateFileName(publicId, mediaType)
    const { publicUrl, path } = await uploadToStorage({
      fileName,
      blob,
      contentType: blob.type,
    })

    // Update database with new URL and status
    const { error: updateError } = await supabase
      .from('memories')
      .update({
        status: 'approved',
        link: publicUrl,
      })
      .eq('id', memoryId)

    if (updateError) {
      // Rollback: delete from Supabase Storage
      await deleteFromStorage(path)
      throw new Error(`Error updating database: ${updateError.message}`)
    }

    // Cleanup: delete from Cloudinary
    await deleteFromCloudinary(cloudinaryUrl, mediaType)

    return {
      memoryId,
      status: 'approved',
      action: 'approved',
      newUrl: publicUrl,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Error approving memory: ${message}`)
  }
}

/**
 * Handle default status update
 */
async function handleDefaultUpdate(
  memoryId: string,
  status: MemoryStatus
): Promise<UpdateStatusResult> {
  const supabase = createClient()

  const { error } = await supabase
    .from('memories')
    .update({ status })
    .eq('id', memoryId)

  if (error) {
    throw new Error(`Error updating status: ${error.message}`)
  }

  return { memoryId, status, action: 'updated' }
}

/**
 * Download file from Cloudinary
 */
async function downloadFromCloudinary(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to download from Cloudinary')
  }
  return response.blob()
}
