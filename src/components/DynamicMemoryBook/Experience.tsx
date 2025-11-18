'use client';

import { Environment, Float, OrbitControls } from '@react-three/drei';
import { Book } from './Book';

interface ExperienceProps {
  memories: Array<{ link: string; id: string }>;
}

export const Experience = ({ memories }: ExperienceProps) => {
  return (
    <>
      <Float
        rotation-x={-Math.PI / 6}
        floatIntensity={0.3}
        speed={1.5}
        rotationIntensity={0.5}
      >
        <Book memories={memories} />
      </Float>
      <OrbitControls 
        enableZoom={true} 
        enablePan={true}
        minDistance={2.5}
        maxDistance={6}
        enableDamping={true}
        dampingFactor={0.05}
      />
      <Environment preset="sunset" />
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
