'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience, UI } from '@/components/DynamicMemoryBook';
import { useMemoriesForBook } from '@/hooks/useMemoriesForBook';

function MemoriesBookContent() {
  const { memories, isLoading, error } = useMemoriesForBook();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
        <div className="text-center text-white p-8">
          <h2 className="text-2xl font-bold mb-4">Error al cargar memorias</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
        <div className="text-white text-xl">Cargando libro de memorias...</div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
        <div className="text-center text-white p-8">
          <h2 className="text-2xl font-bold mb-4">No hay memorias para mostrar</h2>
          <p className="text-gray-400">Agrega memorias aprobadas para ver el libro 3D</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(memories.length / 2) + 1;

  return (
    <>
      <div className="fixed inset-0 bg-linear-to-br from-[#2C1810] via-[#1a0f0a] to-black" />
      <UI totalPages={totalPages} />
      <Loader />
      <Canvas
        shadows
        camera={{
          position: [-0.5, 1, 4],
          fov: 45,
        }}
        gl={{ antialias: true }}
      >
        <group position={[0, 0, 0]}>
          <Suspense fallback={null}>
            <Experience memories={memories} />
          </Suspense>
        </group>
      </Canvas>
    </>
  );
}

export default function MemoriesPage() {
  return <MemoriesBookContent />;
}
