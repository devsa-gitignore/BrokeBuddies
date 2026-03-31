'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function RotatingCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[3, 3, 3]} />
      <meshBasicMaterial color="#7000cc" wireframe />
    </mesh>
  );
}

export default function VoxelBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-retro-black">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <RotatingCube />
      </Canvas>
    </div>
  );
}
