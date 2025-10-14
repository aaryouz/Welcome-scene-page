'use client';
import { Image } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function ZebraMascot() {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      // Subtle bob + slow sway
      ref.current.position.y = -80 + Math.sin(t * 1.2) * 2;
      ref.current.rotation.z = Math.sin(t * 0.6) * 0.02;
    }
  });

  return (
    <group ref={ref} position={[-520, -120, 0]}>
      {/* Tweak scale/position so it feels grounded in front-left */}
      <Image url="/assets/zebra.png" scale={[400, 700, 1]} transparent />
    </group>
  );
}
