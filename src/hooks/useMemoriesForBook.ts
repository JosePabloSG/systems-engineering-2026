'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Memory } from '@/types/memory';

interface MemoryForBook {
  id: string;
  link: string;
  title?: string;
  description?: string;
  date: string;
}

export function useMemoriesForBook() {
  const [memories, setMemories] = useState<MemoryForBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMemories() {
      try {
        const supabase = createClient();
        
        const { data, error: fetchError } = await supabase
          .from('memories')
          .select('id, link, title, description, date, media_type')
          .eq('status', 'approved')
          .eq('media_type', 'image')
          .order('date', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setMemories(data as MemoryForBook[]);
        }
      } catch (err) {
        console.error('Error fetching memories:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMemories();
  }, []);

  return { memories, isLoading, error };
}
