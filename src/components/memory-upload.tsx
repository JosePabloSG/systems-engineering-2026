'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUploadMemory } from '@/hooks/use-upload-memory'
import { useCategories } from '@/hooks/use-categories'

/**
 * Props para el componente de carga de memorias
 * @property onSuccess - Callback opcional que se ejecuta después de subir exitosamente una memoria
 */
interface MemoryUploadProps {
  readonly onSuccess?: () => void;
}

/**
 * Componente para subir nuevas memorias (fotos/videos) al libro
 * Permite seleccionar archivo, agregar título, descripción, fecha y categoría
 * Las memorias quedan pendientes de aprobación por un administrador
 */
export default function MemoryUpload({ onSuccess }: MemoryUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)

  const { mutate: uploadMemory, isPending } = useUploadMemory()
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !date) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    uploadMemory(
      {
        title: title || undefined,
        description: description || undefined,
        date,
        category_id: categoryId,
        file: selectedFile,
      },
      {
        onSuccess: () => {
          resetForm()
          if (onSuccess) onSuccess()
          alert('Memoria subida exitosamente! Está pendiente de aprobación.')
        },
        onError: (error) => {
          alert(`Error al subir la memoria: ${error.message}`)
        },
      }
    )
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setTitle('')
    setDescription('')
    setDate('')
    setCategoryId(undefined)
  }

  return (
    <div className="w-full">
      {/* File upload preview */}
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100"
          aria-label="Seleccionar archivo de foto o video"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              Selecciona una foto o video
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, MP4 (Max. 50MB)
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            aria-label="Archivo de memoria"
          />
        </label>

        {/* Preview */}
        {previewUrl && (
          <div className="mt-4 rounded-lg overflow-hidden border-2 border-gray-200">
            {selectedFile?.type.startsWith('video/') ? (
              <video
                src={previewUrl}
                className="w-full h-auto max-h-64 object-cover"
                controls
                aria-label="Vista previa del video seleccionado"
              >
                <track kind="captions" label="Sin subtítulos disponibles" />
              </video>
            ) : (
              <img
                src={previewUrl || '/placeholder.svg'}
                alt="Vista previa de la imagen seleccionada"
                className="w-full h-auto max-h-64 object-cover"
              />
            )}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-700">
            Título
          </label>
          <Input
            id="title"
            type="text"
            placeholder="Ej: Cumpleaños de María"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700">
            Descripción
          </label>
          <Textarea
            id="description"
            placeholder="Describe esta memoria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1 text-gray-700">
            Fecha *
          </label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1 text-gray-700">
            Categoría
          </label>
          <select
            id="category"
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={categoriesLoading}
          >
            <option value="">Sin categoría</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={!selectedFile || isPending}
          >
            {isPending ? 'Subiendo...' : 'Guardar Memoria'}
          </Button>
        </div>

        {!selectedFile && (
          <p className="text-xs text-gray-500 text-center">
            Selecciona un archivo para continuar
          </p>
        )}
      </form>
    </div>
  )
}
