'use client';
import { Image } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useUI } from '@/store/ui';

export default function ZebraMascot() {
  const groupRef = useRef<THREE.Group>(null!);
  const zebraRef = useRef<THREE.Mesh>(null!);
  const shadowRef = useRef<THREE.Mesh>(null!);
  const { size } = useThree();
  const hover = useUI((s) => s.hover);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

  // Calculate responsive positioning based on viewport
  const zebraScale = Math.min(size.width, size.height) * 0.15; // Responsive scale
  const zebraWidth = zebraScale * 0.65; // Aspect ratio ~0.65 for zebra
  const zebraHeight = zebraScale;

  // Position zebra on the left side of the boardwalk, on the floor
  const baseX = -size.width * 0.25; // Left side, centered in left area
  const baseY = -size.height * 0.35; // On the floor level

  // Intro animation
  useEffect(() => {
    if (groupRef.current) {
      // Start off-screen left
      groupRef.current.position.x = -size.width;
      setTimeout(() => setHasAnimatedIn(true), 100);
    }
  }, [size.width]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Animate walk-in
      if (!hasAnimatedIn) {
        return;
      }

      // Smooth walk-in animation
      const walkProgress = Math.min((t - 0.1) / 1.5, 1);
      const easedProgress = 1 - Math.pow(1 - walkProgress, 3); // Ease out cubic
      groupRef.current.position.x = THREE.MathUtils.lerp(
        -size.width,
        baseX,
        easedProgress
      );

      // Idle animation after walk-in
      if (walkProgress >= 1 && zebraRef.current) {
        // Gentle breathing/bob
        zebraRef.current.position.y = Math.sin(t * 1.5) * 1.5;

        // React to door hover - turn slightly toward the door
        if (hover === 'vcs') {
          // VCs door is on left, zebra looks slightly left
          zebraRef.current.rotation.z = THREE.MathUtils.lerp(
            zebraRef.current.rotation.z,
            -0.05,
            0.1
          );
        } else if (hover === 'founders') {
          // Founders door is on right, zebra looks right
          zebraRef.current.rotation.z = THREE.MathUtils.lerp(
            zebraRef.current.rotation.z,
            0.08,
            0.1
          );
        } else {
          // No hover - neutral position with subtle sway
          zebraRef.current.rotation.z = THREE.MathUtils.lerp(
            zebraRef.current.rotation.z,
            Math.sin(t * 0.6) * 0.02,
            0.05
          );
        }
      }
    }

    // Animate shadow to sync with zebra bob
    if (shadowRef.current && zebraRef.current) {
      const bobAmount = zebraRef.current.position.y;
      // Shadow gets slightly smaller/lighter when zebra bobs up
      const shadowScale = 1 - (bobAmount * 0.01);
      shadowRef.current.scale.set(shadowScale, shadowScale * 0.5, 1);
      const material = shadowRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = 0.25 * shadowScale;
      }
    }
  });

  return (
    <group ref={groupRef} position={[baseX, baseY, 1]}>
      {/* Shadow on the floor */}
      <mesh
        ref={shadowRef}
        position={[0, -zebraHeight * 0.52, -0.05]}
        scale={[zebraWidth * 0.45, zebraHeight * 0.12, 1]}
      >
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Zebra tour guide mascot */}
      <group ref={zebraRef}>
        <Image
          url="/assets/zebra.png"
          scale={[zebraWidth, zebraHeight]}
          transparent
        />
      </group>
    </group>
  );
}
