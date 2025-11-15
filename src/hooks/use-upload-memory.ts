'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { uploadToCloudinary } from '@/lib/cloudinary'
import type { CreateMemoryInput, UploadMemoryResponse, MediaType } from '@/types/memory'

interface UploadMemoryError {
  message: string
  details?: unknown
}

async function uploadMemory(input: CreateMemoryInput): Promise<UploadMemoryResponse> {
  const supabase = createClient()

  const cloudinaryData = await uploadToCloudinary(input.file)
  const mediaType: MediaType = cloudinaryData.resource_type === 'video' ? 'video' : 'image'

  const { data: memoryData, error: memoryError } = await supabase
    .from('memories')
    .insert({
      title: input.title,
      description: input.description,
      date: input.date,
      category_id: input.category_id || null,
      link: cloudinaryData.secure_url,
      media_type: mediaType,
      status: 'pending',
    })
    .select()
    .single()

  if (memoryError) {
    throw new Error(`Error al crear la memoria: ${memoryError.message}`)
  }

  return {
    memory: memoryData,
    url: cloudinaryData.secure_url,
  }
}

export function useUploadMemory() {
  const queryClient = useQueryClient()

  return useMutation<UploadMemoryResponse, UploadMemoryError, CreateMemoryInput>({
    mutationFn: uploadMemory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}
