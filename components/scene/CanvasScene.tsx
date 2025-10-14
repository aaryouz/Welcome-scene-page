'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, Preload } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import BackgroundHouses from './BackgroundHouses';
import ZebraMascot from './ZebraMascot';
import HouseHotspots from './HouseHotspots';

function ParallaxRig() {
  const { camera, size } = useThree();
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  useFrame(({ pointer }) => {
    // Enhanced parallax for more immersive depth feeling
    const amt = 15; // Increased from 8 for more noticeable effect

    // Update targets
    targetX.current = -pointer.x * amt;
    targetY.current = pointer.y * amt;

    // Smooth lerp for fluid motion
    currentX.current = THREE.MathUtils.lerp(currentX.current, targetX.current, 0.08);
    currentY.current = THREE.MathUtils.lerp(currentY.current, targetY.current, 0.08);

    // Apply camera movement
    camera.position.set(currentX.current, currentY.current, 10);
    (camera as THREE.OrthographicCamera).updateProjectionMatrix();
  });

  // keep ortho frustum synced to viewport so 1 world unit ≈ 1 pixel
  useFrame(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.left   = -size.width / 2;
    cam.right  =  size.width / 2;
    cam.top    =  size.height / 2;
    cam.bottom = -size.height / 2;
  });

  return null;
}

export default function CanvasScene() {
  return (
    <Canvas
      orthographic
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera, size }) => {
        const cam = camera as THREE.OrthographicCamera;
        cam.position.set(0, 0, 10);
        cam.near = -1000;
        cam.far = 1000;
        cam.left   = -size.width / 2;
        cam.right  =  size.width / 2;
        cam.top    =  size.height / 2;
        cam.bottom = -size.height / 2;
        cam.updateProjectionMatrix();
      }}
    >
      <Suspense fallback={null}>
        <BackgroundHouses />
        <ZebraMascot />
        <HouseHotspots />
        <Preload all />
      </Suspense>
      <OrthographicCamera makeDefault />
      <ParallaxRig />
    </Canvas>
  );
}
