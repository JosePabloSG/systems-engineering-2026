'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { MemoryCategory } from '@/types/memory'

async function fetchCategories(): Promise<MemoryCategory[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('memory_categories')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Error al obtener categorías: ${error.message}`)
  }

  return data || []
}

export function useCategories() {
  return useQuery<MemoryCategory[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
