'use client';
import { Image } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useUI } from '@/store/ui';
import { calculatePathPosition, distance } from '@/utils/pathfinding';

export default function ZebraMascot() {
  const groupRef = useRef<THREE.Group>(null!);
  const zebraRef = useRef<THREE.Mesh>(null!);
  const shadowRef = useRef<THREE.Mesh>(null!);
  const { size } = useThree();
  const hover = useUI((s) => s.hover);
  const zebraState = useUI((s) => s.zebraState);
  const targetDoor = useUI((s) => s.targetDoor);
  const setZebraState = useUI((s) => s.setZebraState);
  const setZebraPosition = useUI((s) => s.setZebraPosition);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const [walkStartTime, setWalkStartTime] = useState(0);
  const walkProgressRef = useRef(0);

  // Calculate responsive positioning based on viewport
  const zebraScale = Math.min(size.width, size.height) * 0.2; // Responsive scale
  const zebraWidth = zebraScale * 0.7; // Aspect ratio ~0.65 for zebra
  const zebraHeight = zebraScale;

  // Position zebra on the left side of the boardwalk, on the floor
  const baseX = -size.width * 0; // Left side, centered in left area
  const floorY = -size.height * 0.32; // On the floor level - CONSTANT for floor constraint (moved down)

  // Door positions - matching HouseHotspots.tsx positions
  const getDoorPosition = (door: 'vcs' | 'founders') => {
    if (door === 'vcs') {
      return { x: -size.width * 0.18, y: floorY }; // Updated to match new VCs door position
    } else {
      return { x: size.width * 0.14, y: floorY }; // Updated to match new Founders door position
    }
  };

  // Intro animation
  useEffect(() => {
    if (groupRef.current) {
      // Start off-screen left
      groupRef.current.position.x = -size.width;
      setTimeout(() => setHasAnimatedIn(true), 100);
    }
  }, [size.width]);

  // Start walking when target door is set
  useEffect(() => {
    if (zebraState === 'walking' && targetDoor) {
      setWalkStartTime(performance.now() / 1000);
      walkProgressRef.current = 0;
    }
  }, [zebraState, targetDoor]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (!groupRef.current || !zebraRef.current) return;

    // Initial walk-in animation
    if (!hasAnimatedIn) {
      return;
    }

    // Smooth walk-in animation from off-screen
    const introProgress = Math.min((t - 0.1) / 1.5, 1);
    const easedIntro = 1 - Math.pow(1 - introProgress, 3); // Ease out cubic

    // STATE MACHINE
    switch (zebraState) {
      case 'idle': {
        // Position at base location after intro
        if (introProgress >= 1) {
          groupRef.current.position.x = baseX;
          groupRef.current.position.y = floorY;
        } else {
          // Still doing intro walk-in
          groupRef.current.position.x = THREE.MathUtils.lerp(
            -size.width,
            baseX,
            easedIntro
          );
          groupRef.current.position.y = floorY;
        }

        // Gentle breathing/bob
        const breathingOffset = Math.sin(t * 1.5) * 1.5;
        zebraRef.current.position.y = breathingOffset;

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

        // Update position in store
        setZebraPosition({ x: groupRef.current.position.x, y: groupRef.current.position.y });
        break;
      }

      case 'walking': {
        if (!targetDoor) {
          setZebraState('idle');
          break;
        }

        const walkDuration = 2.0; // 2 seconds to reach door
        const elapsed = t - walkStartTime;
        walkProgressRef.current = Math.min(elapsed / walkDuration, 1);

        const startPos = { x: baseX, y: floorY };
        const endPos = getDoorPosition(targetDoor);

        // Calculate position along path
        const currentPos = calculatePathPosition(
          startPos,
          endPos,
          walkProgressRef.current,
          8 // slight arc height for natural movement
        );

        groupRef.current.position.x = currentPos.x;
        groupRef.current.position.y = floorY; // FLOOR CONSTRAINT - always on floor

        // Walking animation - bob up and down
        const walkCycleSpeed = 8;
        const walkBob = Math.abs(Math.sin(t * walkCycleSpeed)) * 3;
        zebraRef.current.position.y = walkBob;

        // Rotation to face movement direction
        const direction = endPos.x - startPos.x;
        const targetRotation = direction > 0 ? 0.1 : -0.1; // Lean slightly in direction
        zebraRef.current.rotation.z = THREE.MathUtils.lerp(
          zebraRef.current.rotation.z,
          targetRotation,
          0.1
        );

        // Check if arrived
        const distanceToTarget = distance(
          { x: groupRef.current.position.x, y: groupRef.current.position.y },
          endPos
        );

        if (walkProgressRef.current >= 1 || distanceToTarget < 10) {
          setZebraState('arriving');
        }

        // Update position in store
        setZebraPosition({ x: groupRef.current.position.x, y: groupRef.current.position.y });
        break;
      }

      case 'arriving': {
        if (!targetDoor) {
          setZebraState('idle');
          break;
        }

        const doorPos = getDoorPosition(targetDoor);
        groupRef.current.position.x = doorPos.x;
        groupRef.current.position.y = floorY; // FLOOR CONSTRAINT

        // Gentle arrival bob - settling down
        const settleOffset = Math.sin(t * 2) * 1;
        zebraRef.current.position.y = settleOffset;

        // Face forward
        zebraRef.current.rotation.z = THREE.MathUtils.lerp(
          zebraRef.current.rotation.z,
          0,
          0.1
        );

        // Update position in store
        setZebraPosition({ x: groupRef.current.position.x, y: groupRef.current.position.y });

        // Could transition to a new state or stay here
        // For now, zebra stays at door entrance
        break;
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
    <group ref={groupRef} position={[baseX, floorY, 1]}>
      {/* Shadow on the floor */}
      <mesh
        ref={shadowRef}
        position={[0, -zebraHeight * 0.52, -0.05]}
        scale={[zebraWidth * 0.45, zebraHeight * 0.12, 1]}
      >
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Zebra mascot tour guide */}
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
