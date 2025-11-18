'use client';

import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { pageAtom } from './Book';

interface UIProps {
  totalPages: number;
}

/**
 * Determina el label de una página según su posición
 * Portada (0) y contraportada (última) usan símbolos especiales
 */
const getPageLabel = (index: number, totalPages: number): string => {
  if (index === 0) return '⟨';
  if (index === totalPages) return '⟩';
  return index.toString();
};

/**
 * Determina si una página es portada o contraportada
 */
const isCoverPage = (index: number, totalPages: number): boolean => {
  return index === 0 || index === totalPages;
};

/**
 * Genera las clases CSS para un botón de página según su estado
 */
const getPageButtonClasses = (isActive: boolean, isCover: boolean): string => {
  if (isActive && isCover) {
    return 'bg-linear-to-br from-amber-500 to-amber-700 text-white shadow-xl scale-110 w-12 h-12 text-lg';
  }
  if (isActive) {
    return 'bg-white text-black shadow-xl scale-110 w-12 h-12 text-base';
  }
  if (isCover) {
    return 'bg-white/10 text-amber-300 hover:bg-white/20 hover:scale-105 w-9 h-9 text-sm';
  }
  return 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105 w-9 h-9 text-xs';
};

/**
 * Componente UI que renderiza la navegación del libro
 * Permite navegar entre páginas con botones anterior/siguiente y selección directa
 */
export const UI = ({ totalPages }: UIProps) => {
  const [page, setPage] = useAtom(pageAtom);

  useEffect(() => {
    // Opcional: reproducir sonido al cambiar página
    // const audio = new Audio('/audios/page-flip.mp3');
    // audio.volume = 0.3;
    // audio.play().catch(() => {});
  }, [page]);

  const goToPreviousPage = () => setPage(Math.max(0, page - 1));
  const goToNextPage = () => setPage(Math.min(totalPages, page + 1));
  const isFirstPage = page === 0;
  const isLastPage = page === totalPages;

  /**
   * Genera el título descriptivo para cada botón de página
   */
  const getPageTitle = (index: number): string => {
    if (index === 0) return 'Portada';
    if (index === totalPages) return 'Contraportada';
    return `Página ${index}`;
  };

  return (
    <>
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex items-end justify-center pb-8">
        <div className="overflow-auto pointer-events-auto flex items-center gap-2 px-6 py-3 bg-linear-to-r from-black/40 via-black/50 to-black/40 backdrop-blur-lg rounded-full shadow-2xl border border-white/20">
          {/* Botón Anterior */}
          <button
            onClick={goToPreviousPage}
            disabled={isFirstPage}
            className={`transition-all duration-300 rounded-full shrink-0 flex items-center justify-center font-bold text-xl ${
              isFirstPage
                ? 'bg-white/5 text-white/30 cursor-not-allowed w-10 h-10'
                : 'bg-white/15 text-white hover:bg-white/30 hover:scale-110 w-10 h-10'
            }`}
            title="Anterior"
          >
            ←
          </button>

          {/* Páginas */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages + 1 }, (_, i) => i).map((index) => {
              const isActive = index === page;
              const label = getPageLabel(index, totalPages);
              const isCover = isCoverPage(index, totalPages);
              const buttonClasses = getPageButtonClasses(isActive, isCover);
              
              return (
                <button
                  key={`page-${index}-${totalPages}`}
                  className={`transition-all duration-300 rounded-lg shrink-0 flex items-center justify-center font-semibold ${buttonClasses}`}
                  onClick={() => setPage(index)}
                  title={getPageTitle(index)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={goToNextPage}
            disabled={isLastPage}
            className={`transition-all duration-300 rounded-full shrink-0 flex items-center justify-center font-bold text-xl ${
              isLastPage
                ? 'bg-white/5 text-white/30 cursor-not-allowed w-10 h-10'
                : 'bg-white/15 text-white hover:bg-white/30 hover:scale-110 w-10 h-10'
            }`}
            title="Siguiente"
          >
            →
          </button>
        </div>
      </main>

      <div className="fixed inset-0 flex items-center -rotate-2 select-none pointer-events-none opacity-20">
        <div className="relative">
          <div className="flex items-center gap-8 w-max px-8 animate-horizontal-scroll">
            <h1 className="shrink-0 text-white/30 text-9xl font-black">
              Ingeniería en Sistemas
            </h1>
            <h2 className="shrink-0 text-white/30 text-7xl italic font-light">
              Promoción 2026
            </h2>
            <h2 className="shrink-0 text-white/30 text-10xl font-bold">
              Recuerdos
            </h2>
            <h2 className="shrink-0 text-white/20 text-10xl font-bold italic">
              Memorias
            </h2>
            <h2 className="shrink-0 text-white/30 text-8xl font-medium">
              Juntos
            </h2>
            <h2 className="shrink-0 text-white/30 text-8xl font-extralight italic">
              Amistad
            </h2>
          </div>
        </div>
      </div>
    </>
  );
};
