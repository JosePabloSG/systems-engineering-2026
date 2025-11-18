'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { easing } from 'maath';
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  SEGMENT_WIDTH,
  EASING_FACTOR,
  EASING_FACTOR_FOLD,
  INSIDE_CURVE_STRENGTH,
  OUTSIDE_CURVE_STRENGTH,
  TURNING_CURVE_STRENGTH,
  WHITE_COLOR,
  EMISSIVE_COLOR,
  SPINE_COLOR,
} from '@/lib/book-utils';

const pageGeometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2);
pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes: number[] = [];
const skinWeights: number[] = [];

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);
  const x = vertex.x;
  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
  const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndexes, 4));
pageGeometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));

const whiteColor = new Color(WHITE_COLOR);
const emissiveColor = new Color(EMISSIVE_COLOR);

const baseMaterials = [
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: SPINE_COLOR }),
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: whiteColor }),
];

interface PageProps {
  number: number;
  front: string;
  back: string;
  page: number;
  opened: boolean;
  bookClosed: boolean;
  totalPages: number;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onClick: () => void;
  highlighted: boolean;
}

export const Page = ({
  number,
  front,
  back,
  page,
  opened,
  bookClosed,
  totalPages,
  onPointerEnter,
  onPointerLeave,
  onClick,
  highlighted,
}: PageProps) => {
  const group = useRef<any>(null);
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const skinnedMeshRef = useRef<SkinnedMesh>(null);

  const isCover = number === 0;
  const isBackCover = number === totalPages - 1;

  // Validar URLs y usar placeholder si es necesario
  const frontUrl = (!front || front === 'cover' || front === 'back-cover') 
    ? '/textures/placeholder.jpg' 
    : front;
  const backUrl = (!back || back === 'cover' || back === 'back-cover') 
    ? '/textures/placeholder.jpg' 
    : back;

  const [picture, picture2] = useTexture([frontUrl, backUrl], (textures) => {
    for (const texture of textures) {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 16; // Máxima calidad de filtrado
      texture.minFilter = LinearMipmapLinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = true;
    }
  });

  const manualSkinnedMesh = useMemo(() => {
    const bones: Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();
      bones.push(bone);
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
      if (i > 0) bones[i - 1].add(bone);
    }
    const skeleton = new Skeleton(bones);

    const materials = [
      ...baseMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        roughness: isCover ? 0.3 : 0.1,
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        roughness: isBackCover ? 0.3 : 0.1,
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [picture, picture2, isCover, isBackCover]);

  /**
   * Actualiza la intensidad emisiva de los materiales para efecto de hover
   */
  const updateMaterialEmissive = (materials: MeshStandardMaterial[], highlighted: boolean, delta: number) => {
    const emissiveIntensity = highlighted ? 0.22 : 0;
    
    if (materials[4] && materials[5]) {
      materials[4].emissiveIntensity = materials[5].emissiveIntensity = MathUtils.lerp(
        materials[4].emissiveIntensity,
        emissiveIntensity,
        0.1
      );
    }
  };

  /**
   * Calcula el ángulo de rotación de un hueso basado en su posición y el estado del libro
   */
  const calculateBoneRotation = (
    boneIndex: number,
    totalBones: number,
    targetRotation: number,
    turningTime: number,
    bookClosed: boolean
  ) => {
    // Si el libro está cerrado, solo el primer hueso rota
    if (bookClosed) {
      return boneIndex === 0 ? targetRotation : 0;
    }

    const insideCurveIntensity = boneIndex < 8 ? Math.sin(boneIndex * 0.2 + 0.25) : 0;
    const outsideCurveIntensity = boneIndex >= 8 ? Math.cos(boneIndex * 0.3 + 0.09) : 0;
    const turningIntensity = Math.sin(boneIndex * Math.PI * (1 / totalBones)) * turningTime;

    return (
      INSIDE_CURVE_STRENGTH * insideCurveIntensity * targetRotation -
      OUTSIDE_CURVE_STRENGTH * outsideCurveIntensity * targetRotation +
      TURNING_CURVE_STRENGTH * turningIntensity * targetRotation
    );
  };

  /**
   * Calcula el ángulo de doblado para simular flexión de papel
   */
  const calculateFoldAngle = (boneIndex: number, totalBones: number, turningTime: number, bookClosed: boolean) => {
    if (bookClosed) return 0;

    const foldIntensity = boneIndex > 8 
      ? Math.sin(boneIndex * Math.PI * (1 / totalBones) - 0.5) * turningTime 
      : 0;

    return degToRad(Math.sign(opened ? -Math.PI / 2 : Math.PI / 2) * 2) * foldIntensity;
  };

  /**
   * Hook de animación principal - actualiza la página en cada frame
   * Maneja el efecto de volteo y curvatura realista del papel
   */
  useFrame((_, delta) => {
    if (!skinnedMeshRef.current || !group.current) return;

    const materials = skinnedMeshRef.current.material as MeshStandardMaterial[];
    updateMaterialEmissive(materials, highlighted, delta);

    // Registra el momento en que cambió el estado opened/closed
    if (lastOpened.current !== opened) {
      turnedAt.current = Date.now();
      lastOpened.current = opened;
    }

    // Calcula el progreso de la animación (0 a 1) con easing sinusoidal
    let turningTime = Math.min(400, Date.now() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    // Calcula rotación objetivo según si la página está abierta o cerrada
    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) targetRotation += degToRad(number * 0.8);

    // Anima cada hueso del esqueleto para crear efecto de curvatura
    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];
      
      const rotationAngle = calculateBoneRotation(i, bones.length, targetRotation, turningTime, bookClosed);
      const foldAngle = calculateFoldAngle(i, bones.length, turningTime, bookClosed);

      // Aplica suavizado a las rotaciones para movimiento fluido
      easing.dampAngle(target.rotation, 'y', rotationAngle, EASING_FACTOR, delta);
      easing.dampAngle(target.rotation, 'x', foldAngle, EASING_FACTOR_FOLD, delta);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick();
  };

  const handlePointerEnter = (e: any) => {
    e.stopPropagation();
    onPointerEnter();
  };

  const handlePointerLeave = (e: any) => {
    e.stopPropagation();
    onPointerLeave();
  };

  return (
    <group 
      ref={group} 
      onPointerEnter={handlePointerEnter} 
      onPointerLeave={handlePointerLeave} 
      onClick={handleClick}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef as any}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};
