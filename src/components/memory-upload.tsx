'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { useUploadMemory } from '@/hooks/use-upload-memory'
import { useCategories } from '@/hooks/use-categories'

export default function MemoryUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)

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
          setShowModal(false)
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

  const openModal = () => {
    resetForm()
    setShowModal(true)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Book placeholder */}
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full h-96 bg-white flex items-center justify-center border-2 border-gray-200 rounded-lg">
            <p className="text-gray-400 text-lg">Aquí va el libro</p>
          </Card>
        </div>

        {/* Right side - Retro photo card that opens modal */}
        <div className="flex items-center justify-center">
          <button
            onClick={openModal}
            className="group relative w-72 cursor-pointer perspective"
          >
            {/* Polaroid-style card */}
            <div className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden relative">
                {/* Retro photo frame styling */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100 border-4 border-white">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500 font-medium">
                      Agregar Foto
                    </p>
                  </div>
                </div>
              </div>
              {/* Polaroid bottom caption area */}
              <div className="bg-white px-4 py-3 text-center">
                <p className="text-xs text-gray-600 font-handwriting">
                  Crea un nuevo recuerdo
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Modal overlay */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setShowModal(false)}
        />
      )}

      {/* Modal drawer from right */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto ${
          showModal ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-2xl font-bold mb-6 pr-6">Crear Recuerdo</h2>

          {/* File upload preview in modal */}
          <div className="mb-6">
            <label
              htmlFor="file-upload-modal"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 text-primary/60 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-sm font-medium text-foreground">
                  Selecciona una foto
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, MP4 (Max. 50MB)
                </p>
              </div>
              <input
                id="file-upload-modal"
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />
            </label>

            {/* Preview in modal */}
            {previewUrl && (
              <div className="mt-4 rounded-lg overflow-hidden bg-black/5">
                {selectedFile?.type.startsWith('video/') ? (
                  <video
                    src={previewUrl}
                    className="w-full h-auto max-h-40 object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={previewUrl || '/placeholder.svg'}
                    alt="Preview"
                    className="w-full h-auto max-h-40 object-cover"
                  />
                )}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Título
              </label>
              <Input
                type="text"
                placeholder="Ej: Cumpleaños de María"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Descripción
              </label>
              <Textarea
                placeholder="Describe esta memoria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Categoría
              </label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
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

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={!selectedFile || isPending}
              >
                {isPending ? 'Subiendo...' : 'Guardar Memoria (Pendiente)'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
            </div>

            {!selectedFile && (
              <p className="text-xs text-muted-foreground">
                Selecciona un archivo para continuar
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
