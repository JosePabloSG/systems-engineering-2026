'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { Memory } from '@/types/memory'

async function fetchMemories(): Promise<Memory[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    throw new Error(`Error al obtener memorias: ${error.message}`)
  }

  return data || []
}

export function useMemories() {
  return useQuery<Memory[], Error>({
    queryKey: ['memories'],
    queryFn: fetchMemories,
    staleTime: 1 * 60 * 1000,
  })
}
