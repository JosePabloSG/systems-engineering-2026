import Image from 'next/image'
import MemoryUpload from '@/components/memory-upload'

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 w-full">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-12 sm:items-start">
            <h1 className="text-4xl font-bold">Libro de Fotos y Recuerdos - Ingeniería en Sistemas 2026</h1>
            <p className="text-lg text-muted-foreground">
              Una colección de momentos vividos en los últimos 4 años
            </p>
          </div>

          <MemoryUpload />
        </div>
      </main>
    </div>
  )
}
