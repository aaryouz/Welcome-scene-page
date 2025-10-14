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
  const target = useRef(new THREE.Vector3());

  useFrame(({ pointer }) => {
    // tiny parallax: move camera a few pixels opposite to mouse
    const amt = 8; // max pixels
    const tx = THREE.MathUtils.lerp(0, -pointer.x * amt, 0.1);
    const ty = THREE.MathUtils.lerp(0,  pointer.y * amt, 0.1);
    camera.position.set(tx, ty, 10);
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
