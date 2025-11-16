/**
 * Memory Status Service
 * Single Responsibility: Handle memory status updates and related operations
 * Strategy Pattern: Different strategies for approve/reject actions
 */

import { createClient } from '@/utils/supabase/client'
import { deleteFromCloudinary } from '@/lib/cloudinary'
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
 * Update status only, keep Cloudinary URL
 */
async function handleApproveMemory(
  memoryId: string,
  cloudinaryUrl: string,
  mediaType: MediaType
): Promise<UpdateStatusResult> {
  const supabase = createClient()

  // Update status in database
  const { error } = await supabase
    .from('memories')
    .update({ status: 'approved' })
    .eq('id', memoryId)

  if (error) {
    throw new Error(`Error approving memory: ${error.message}`)
  }

  return {
    memoryId,
    status: 'approved',
    action: 'approved',
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
