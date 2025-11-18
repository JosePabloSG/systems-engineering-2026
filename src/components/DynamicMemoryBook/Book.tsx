'use client';

import { useEffect, useState } from 'react';
import { useCursor } from '@react-three/drei';
import { atom, useAtom } from 'jotai';
import { Page } from './Page';
import { generatePagesFromMemories } from '@/lib/book-utils';

/**
 * Estado global de la página actual del libro
 * Compartido entre componentes Book y UI para sincronizar navegación
 */
export const pageAtom = atom(0);

/**
 * Datos de una página del libro (spread doble)
 */
interface BookPageData {
  front: string;      // URL de imagen o 'cover'/'back-cover'
  back: string;       // URL de imagen o 'cover'/'back-cover'
  frontId?: string;   // ID de la memoria (si aplica)
  backId?: string;    // ID de la memoria (si aplica)
}

/**
 * Props del componente Book
 */
interface BookProps {
  memories: Array<{ link: string; id: string }>;  // Memorias aprobadas desde Supabase
}

/**
 * Componente principal que renderiza el libro 3D completo
 * 
 * Maneja la lógica de navegación entre páginas, incluyendo:
 * - Animación retrasada para permitir que las páginas terminen de voltearse
 * - Efecto de hover (highlighted) para feedback visual
 * - Cursor personalizado según si se puede interactuar con una página
 * 
 * El libro usa un sistema de "spreads" (páginas dobles) donde cada componente Page
 * representa ambos lados de una hoja física.
 */
export const Book = ({ memories }: BookProps) => {
  const [page, setPage] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const [highlighted, setHighlighted] = useState<number | null>(null);

  // Convierte el array plano de memorias en spreads de páginas
  const pages: BookPageData[] = generatePagesFromMemories(memories);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage;
        } else {
          timeout = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(page - delayedPage) > 2 ? 50 : 150
          );
          if (page > delayedPage) {
            return delayedPage + 1;
          }
          if (page < delayedPage) {
            return delayedPage - 1;
          }
        }
        return delayedPage;
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [page]);

  useCursor(highlighted !== null);

  return (
    <group rotation-y={-Math.PI / 2}>
      {pages.map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          totalPages={pages.length}
          front={pageData.front}
          back={pageData.back}
          highlighted={highlighted === index}
          onPointerEnter={() => setHighlighted(index)}
          onPointerLeave={() => setHighlighted(null)}
          onClick={() => {
            setPage(delayedPage > index ? index : index + 1);
            setHighlighted(null);
          }}
        />
      ))}
    </group>
  );
};
