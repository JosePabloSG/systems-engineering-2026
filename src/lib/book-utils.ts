/**
 * Constantes y utilidades para el libro 3D de memorias
 * 
 * Este archivo define las dimensiones físicas del libro, los parámetros de animación
 * y las funciones para convertir memorias en páginas renderizables.
 */

// Dimensiones del libro (en unidades de Three.js)
export const PAGE_WIDTH = 1.28;    // Ancho de cada página
export const PAGE_HEIGHT = 1.71;   // Alto de cada página (proporción ~4:3)
export const PAGE_DEPTH = 0.003;   // Grosor del papel
export const PAGE_SEGMENTS = 30;   // Número de segmentos (huesos) para curvatura
export const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

// Factores de animación - controlan la suavidad del movimiento
export const EASING_FACTOR = 0.5;           // Velocidad de rotación principal
export const EASING_FACTOR_FOLD = 0.3;      // Velocidad del efecto de doblado

// Factores de curvatura - controlan cómo se dobla el papel
export const INSIDE_CURVE_STRENGTH = 0.18;  // Curvatura interior (cerca del lomo)
export const OUTSIDE_CURVE_STRENGTH = 0.05; // Curvatura exterior (borde libre)
export const TURNING_CURVE_STRENGTH = 0.09; // Intensidad durante el volteo

// Colores del libro
export const WHITE_COLOR = 'white';         // Color base de las páginas
export const EMISSIVE_COLOR = 'orange';     // Color de brillo al hacer hover
export const SPINE_COLOR = '#111';          // Color del lomo del libro

/**
 * Genera pares de páginas desde un array de memorias
 * 
 * Convierte un array plano de memorias en páginas dobles (spreads) para el libro 3D.
 * Cada spread tiene una página frontal (derecha) y una trasera (izquierda).
 * 
 * Estructura del libro:
 * - Primera spread: portada (cover) + primera memoria
 * - Spreads intermedios: pares de memorias (2 por spread)
 * - Última spread: última memoria + contraportada (back-cover)
 * 
 * @param memories - Array de objetos con link (URL de imagen) e id
 * @returns Array de spreads con propiedades front, back, frontId, backId
 * 
 * @example
 * const memories = [
 *   { link: 'photo1.jpg', id: '1' },
 *   { link: 'photo2.jpg', id: '2' },
 *   { link: 'photo3.jpg', id: '3' }
 * ];
 * const pages = generatePagesFromMemories(memories);
 * // Resultado:
 * // [
 * //   { front: 'cover', back: 'photo1.jpg', backId: '1' },
 * //   { front: 'photo2.jpg', back: 'photo3.jpg', frontId: '2', backId: '3' },
 * //   { front: 'back-cover', back: undefined }
 * // ]
 */
export function generatePagesFromMemories(memories: Array<{ link: string; id: string }>) {
  const pages: Array<{ front: string; back: string; frontId?: string; backId?: string }> = [];
  
  // Portada
  pages.push({
    front: 'cover',
    back: memories[0]?.link || 'cover',
    backId: memories[0]?.id,
  });

  // Páginas intermedias
  // Páginas del medio - emparejamos memorias de 2 en 2
  for (let i = 1; i < memories.length - 1; i += 2) {
    pages.push({
      front: memories[i]?.link || 'cover',
      back: memories[i + 1]?.link || 'cover',
      frontId: memories[i]?.id,
      backId: memories[i + 1]?.id,
    });
  }

  // Contraportada - usa .at(-1) en lugar de [length - 1]
  const lastMemory = memories.at(-1);
  if (memories.length > 1) {
    pages.push({
      front: lastMemory?.link || 'cover',
      back: 'back-cover',
      frontId: lastMemory?.id,
    });
  }

  return pages;
}
