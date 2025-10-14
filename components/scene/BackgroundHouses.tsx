'use client';
import { Image, useProgress } from '@react-three/drei';
import { useFitImage } from './useFitImage';
import { useUI } from '@/store/ui';
import { useEffect } from 'react';

const HOUSES_W = 1920; // set to your source image size
const HOUSES_H = 1080;

export default function BackgroundHouses() {
  const { width, height } = useFitImage(HOUSES_W, HOUSES_H);
  const { progress } = useProgress();
  const setReady = useUI((s) => s.setReady);

  useEffect(() => {
    if (progress === 100) setReady(true);
  }, [progress, setReady]);

  return (
    <group position={[0, 0, 0]}>
      <Image
        url="/assets/houses.png"
        scale={[width, height, 1]}
        position={[0, 0, -0.1]} // slightly behind hotspots & zebra
        toneMapped={false}
      />
    </group>
  );
}
