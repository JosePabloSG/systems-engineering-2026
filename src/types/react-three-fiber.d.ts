import '@react-three/fiber';
import { Object3DNode } from '@react-three/fiber';
import { Mesh, DirectionalLight, PlaneGeometry, ShadowMaterial } from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    primitive: any;
    mesh: Object3DNode<Mesh, typeof Mesh>;
    directionalLight: Object3DNode<DirectionalLight, typeof DirectionalLight>;
    planeGeometry: Object3DNode<PlaneGeometry, typeof PlaneGeometry>;
    shadowMaterial: Object3DNode<ShadowMaterial, typeof ShadowMaterial>;
  }
}
