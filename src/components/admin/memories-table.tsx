'use client'

import { useState } from 'react'
import { useMemories } from '@/hooks/use-pending-memories'
import { useUpdateMemoryStatus } from '@/hooks/use-update-memory-status'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Memory, MemoryStatus } from '@/types/memory'

const STATUS_CONFIG = {
  pending: { label: 'Pendientes', variant: 'secondary' as const, color: 'text-yellow-700 bg-yellow-50' },
  approved: { label: 'Aprobadas', variant: 'default' as const, color: 'text-green-700 bg-green-50' },
  rejected: { label: 'Rechazadas', variant: 'destructive' as const, color: 'text-red-700 bg-red-50' },
  all: { label: 'Todas', variant: 'outline' as const, color: '' },
}

export function MemoriesTable() {
  const [selectedStatus, setSelectedStatus] = useState<MemoryStatus | 'all'>('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  
  const { data, isLoading } = useMemories({
    status: selectedStatus,
    page: currentPage,
    pageSize: 10,
  })

  const updateStatus = useUpdateMemoryStatus()

  const handleApprove = async (memory: Memory) => {
    await updateStatus.mutateAsync({ 
      memoryId: memory.id, 
      status: 'approved',
      cloudinaryUrl: memory.link,
      mediaType: memory.media_type
    })
    setSelectedMemory(null)
  }

  const handleReject = async (memory: Memory) => {
    await updateStatus.mutateAsync({ 
      memoryId: memory.id, 
      status: 'rejected',
      cloudinaryUrl: memory.link,
      mediaType: memory.media_type
    })
    setSelectedMemory(null)
  }

  const handleTabChange = (value: string) => {
    setSelectedStatus(value as MemoryStatus | 'all')
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const { memories = [], total = 0, totalPages = 0 } = data || {}

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Tabs value={selectedStatus} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pendientes {selectedStatus === 'pending' && `(${total})`}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprobadas {selectedStatus === 'approved' && `(${total})`}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rechazadas {selectedStatus === 'rejected' && `(${total})`}
          </TabsTrigger>
          <TabsTrigger value="all">
            Todas {selectedStatus === 'all' && `(${total})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-4 mt-6">
          {memories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-500 text-lg">No hay memorias {STATUS_CONFIG[selectedStatus].label.toLowerCase()}</p>
              <p className="text-gray-400 text-sm mt-2">Las solicitudes aparecerán aquí</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="flex items-center justify-between px-2">
                <p className="text-sm text-gray-600">
                  Mostrando <span className="font-medium">{memories.length}</span> de{' '}
                  <span className="font-medium">{total}</span> memorias
                </p>
                <div className="text-sm text-gray-500">
                  Página {currentPage} de {totalPages}
                </div>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Imagen</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead className="max-w-xs">Descripción</TableHead>
                      <TableHead className="w-30">Fecha</TableHead>
                      <TableHead className="w-30">Estado</TableHead>
                      <TableHead className="text-right w-50">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memories.map((memory) => (
                      <TableRow key={memory.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Avatar 
                            className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all" 
                            onClick={() => setSelectedMemory(memory)}
                          >
                            <AvatarImage src={memory.link} alt={memory.title || 'Memoria'} />
                            <AvatarFallback>
                              {memory.media_type === 'video' ? '▶' : '🖼'}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          {memory.title || <span className="text-gray-400">Sin título</span>}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="truncate text-sm text-gray-600">
                            {memory.description || <span className="text-gray-400">Sin descripción</span>}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(memory.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={STATUS_CONFIG[memory.status].variant}
                            className={STATUS_CONFIG[memory.status].color}
                          >
                            {STATUS_CONFIG[memory.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {memory.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(memory)}
                                  disabled={updateStatus.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Aprobar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(memory)}
                                  disabled={updateStatus.isPending}
                                >
                                  Rechazar
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedMemory(memory)}
                            >
                              Ver
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer hover:bg-gray-100'
                        }
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page: number
                      if (totalPages <= 5) {
                        page = i + 1
                      } else if (currentPage <= 3) {
                        page = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i
                      } else {
                        page = currentPage - 2 + i
                      }
                      
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer hover:bg-gray-100'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!selectedMemory} onOpenChange={() => setSelectedMemory(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedMemory?.title || 'Sin título'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedMemory?.description || 'Sin descripción'}
            </DialogDescription>
          </DialogHeader>
          {selectedMemory && (
            <div className="space-y-4">
              {/* Media Preview */}
              <div className="relative w-full overflow-hidden rounded-lg bg-gray-100">
                {selectedMemory.media_type === 'image' ? (
                  <img
                    src={selectedMemory.link}
                    alt={selectedMemory.title || 'Memoria'}
                    className="w-full h-auto max-h-[60vh] object-contain"
                  />
                ) : (
                  <video
                    src={selectedMemory.link}
                    controls
                    className="w-full h-auto max-h-[60vh]"
                  />
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedMemory.date).toLocaleDateString('es-ES', {
                      dateStyle: 'full',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <Badge 
                    variant={STATUS_CONFIG[selectedMemory.status].variant}
                    className={STATUS_CONFIG[selectedMemory.status].color}
                  >
                    {STATUS_CONFIG[selectedMemory.status].label}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              {selectedMemory.status === 'pending' && (
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(selectedMemory)}
                    disabled={updateStatus.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ✓ Aprobar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedMemory)}
                    disabled={updateStatus.isPending}
                  >
                    ✕ Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
