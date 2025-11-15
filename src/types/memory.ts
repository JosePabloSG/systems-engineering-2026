export type MemoryStatus = 'pending' | 'approved' | 'rejected'
export type MediaType = 'image' | 'video'

export interface Memory {
  id: string
  title?: string
  description?: string
  date: string
  status: MemoryStatus
  link: string
  media_type: MediaType
  category_id?: string
  created_at: string
  updated_at: string
}

export interface MemoryCategory {
  id: string
  name: string
  slug: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateMemoryInput {
  title?: string
  description?: string
  date: string
  category_id?: string
  file: File
}

export interface UploadMemoryResponse {
  memory: Memory
  url: string
}
