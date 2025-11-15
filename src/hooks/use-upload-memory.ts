'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { CreateMemoryInput, UploadMemoryResponse, MediaType } from '@/types/memory'

interface UploadMemoryError {
  message: string
  details?: unknown
}

async function uploadMemory(input: CreateMemoryInput): Promise<UploadMemoryResponse> {
  const supabase = createClient()

  // Determine media type from file
  const mediaType: MediaType = input.file.type.startsWith('video/') ? 'video' : 'image'

  // Generate unique filename
  const fileExt = input.file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('memories')
    .upload(filePath, input.file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Error al subir el archivo: ${uploadError.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('memories')
    .getPublicUrl(uploadData.path)

  // Create memory record in database
  const { data: memoryData, error: memoryError } = await supabase
    .from('memories')
    .insert({
      title: input.title,
      description: input.description,
      date: input.date,
      category_id: input.category_id || null,
      link: publicUrl,
      media_type: mediaType,
      status: 'pending',
    })
    .select()
    .single()

  if (memoryError) {
    // If memory creation fails, try to delete the uploaded file
    await supabase.storage.from('memories').remove([uploadData.path])
    throw new Error(`Error al crear la memoria: ${memoryError.message}`)
  }

  return {
    memory: memoryData,
    url: publicUrl,
  }
}

export function useUploadMemory() {
  const queryClient = useQueryClient()

  return useMutation<UploadMemoryResponse, UploadMemoryError, CreateMemoryInput>({
    mutationFn: uploadMemory,
    onSuccess: () => {
      // Invalidate queries to refetch memories list if needed
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
    onError: (error) => {
      console.error('Upload error:', error)
    },
  })
}
