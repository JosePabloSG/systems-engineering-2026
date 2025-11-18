'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { useMemoriesForBook } from '@/hooks/useMemoriesForBook';
import { Experience, UI } from '@/components/DynamicMemoryBook';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import MemoryUpload from '@/components/memory-upload';

/**
 * Componente que muestra un modal para subir nuevas memorias
 * Se abre desde el botón principal y permite agregar fotos/videos al libro
 */
interface UploadModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function UploadModal({ isOpen, onClose }: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay con blur para enfocar el modal */}
      <button
        type="button"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-default"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Cerrar modal"
      />
      
      {/* Panel deslizante desde la derecha */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Cerrar modal"
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

          <h2 className="text-2xl font-bold mb-6 pr-8">Agregar Nueva Memoria</h2>
          
          <MemoryUpload onSuccess={onClose} />
        </div>
      </div>
    </>
  );
}

/**
 * Pantalla de carga mostrada mientras se obtienen las memorias
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
      <div className="text-white text-xl">Cargando libro de memorias...</div>
    </div>
  );
}

/**
 * Pantalla de error cuando falla la carga de memorias
 */
function ErrorScreen({ error }: { readonly error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
      <div className="text-center text-white p-8">
        <h2 className="text-2xl font-bold mb-4">Error al cargar memorias</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    </div>
  );
}

/**
 * Pantalla vacía cuando no hay memorias aprobadas
 */
function EmptyScreen({ onAddMemory }: { readonly onAddMemory: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
      <div className="text-center text-white p-8">
        <div className="text-6xl mb-6">📖</div>
        <h2 className="text-3xl font-bold mb-4">Libro de Memorias Vacío</h2>
        <p className="text-gray-400 mb-8">Agrega memorias aprobadas para ver el libro 3D</p>
        <Button size="lg" onClick={onAddMemory}>
          Agregar Primera Memoria
        </Button>
      </div>
    </div>
  );
}

/**
 * Componente principal que renderiza el libro 3D con todas las memorias
 * Maneja diferentes estados: carga, error, vacío y libro completo
 */
function MemoriesBookFullScreen() {
  const { memories, isLoading, error } = useMemoriesForBook();
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Manejo de estados de carga y error de forma separada
  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (memories.length === 0) return <EmptyScreen onAddMemory={() => setShowUploadModal(true)} />;

  // Calcula el total de páginas (2 memorias por spread + portadas)
  const totalPages = Math.ceil(memories.length / 2) + 1;

  return (
    <>
      {/* Fondo degradado que simula ambiente cálido de libro antiguo */}
      <div className="fixed inset-0 bg-linear-to-br from-[#2C1810] via-[#1a0f0a] to-black" />
      
      {/* Header flotante con título del proyecto */}
      <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Libro de Fotos y Recuerdos - Ingeniería en Sistemas 2026
            </h1>
            <p className="text-sm text-white/80 drop-shadow-lg">
              Una colección de momentos vividos en los últimos 4 años
            </p>
          </div>
        </div>
      </div>

      {/* Botón flotante para agregar nuevas memorias */}
      <div className="fixed top-6 right-6 z-20 pointer-events-auto">
        <Button 
          size="lg" 
          variant="secondary" 
          className="shadow-xl"
          onClick={() => setShowUploadModal(true)}
        >
          + Agregar Foto
        </Button>
      </div>

      {/* Modal para subir memorias - componente separado */}
      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />

      {/* UI de navegación de páginas */}
      <UI totalPages={totalPages} />
      
      {/* Loader de React Three Fiber */}
      <Loader />
      
      {/* ErrorBoundary para capturar errores del canvas 3D */}
      <ErrorBoundary>
        <Canvas
          shadows
          camera={{
            position: [0, 0.5, 4],
            fov: 45,
          }}
          gl={{ antialias: true }}
          style={{ height: '100vh', width: '100vw' }}
        >
          <group position={[0, 0, 0]}>
            <Suspense fallback={null}>
              <Experience memories={memories} />
            </Suspense>
          </group>
        </Canvas>
      </ErrorBoundary>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
          <div className="text-white text-lg">Cargando...</div>
        </div>
      }
    >
      <MemoriesBookFullScreen />
    </Suspense>
  );
}
