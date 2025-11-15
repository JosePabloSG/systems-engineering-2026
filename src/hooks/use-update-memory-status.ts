'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateMemoryStatus } from '@/lib/services/memory-status-service'
import type { MemoryStatus, MediaType } from '@/types/memory'

interface UpdateStatusInput {
  memoryId: string
  status: MemoryStatus
  cloudinaryUrl: string
  mediaType: MediaType
}

const QUERY_KEYS_TO_INVALIDATE = ['pending-memories', 'memories']

/**
 * Hook to update memory status
 * Single Responsibility: Manage status update mutations
 */
export function useUpdateMemoryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMemoryStatus,
    onSuccess: async () => {
      // Invalidate and refetch related queries
      await Promise.all(
        QUERY_KEYS_TO_INVALIDATE.map(async (key) => {
          await queryClient.invalidateQueries({ queryKey: [key] })
          await queryClient.refetchQueries({ queryKey: [key] })
        })
      )
    },
    onError: (error) => {
      console.error('Error updating memory status:', error)
    },
  })
}
