'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { Memory, MemoryStatus } from '@/types/memory'

interface UseMemoriesOptions {
  status?: MemoryStatus | 'all'
  page?: number
  pageSize?: number
}

interface MemoriesQueryResult {
  memories: Memory[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const QUERY_KEY_BASE = 'memories'

/**
 * Hook to fetch memories with filtering and pagination
 * Single Responsibility: Memory data fetching
 */
export function useMemories(options: UseMemoriesOptions = {}) {
  const { status = 'pending', page = 1, pageSize = 10 } = options
  const supabase = createClient()

  return useQuery<MemoriesQueryResult>({
    queryKey: [QUERY_KEY_BASE, status, page, pageSize],
    queryFn: async () => {
      const query = buildMemoriesQuery(supabase, status, page, pageSize)
      const { data, error, count } = await query

      if (error) {
        throw new Error(`Error fetching memories: ${error.message}`)
      }

      return formatQueryResult(data, count, page, pageSize)
    },
  })
}

/**
 * Build Supabase query with filters and pagination
 * Open/Closed Principle: Easy to extend with new filters
 */
function buildMemoriesQuery(
  supabase: ReturnType<typeof createClient>,
  status: MemoryStatus | 'all',
  page: number,
  pageSize: number
) {
  let query = supabase
    .from('memories')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  return query.range(from, to)
}

/**
 * Format query result with pagination metadata
 */
function formatQueryResult(
  data: Memory[] | null,
  count: number | null,
  page: number,
  pageSize: number
): MemoriesQueryResult {
  const total = count || 0
  return {
    memories: data || [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Backward compatibility hook
 */
export function usePendingMemories() {
  return useMemories({ status: 'pending' })
}
