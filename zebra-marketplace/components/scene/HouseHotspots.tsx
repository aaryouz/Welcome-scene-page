'use client';
import { useRouter } from 'next/navigation';
import { useCursor } from '@react-three/drei';
import { useState } from 'react';
import { useUI } from '@/store/ui';

type HotspotProps = {
  to: string;
  rect: { x: number; y: number; w: number; h: number };
  name: 'vcs' | 'founders';
};

function Hotspot({ to, rect, name }: HotspotProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const setHover = useUI((s) => s.setHover);

  // Change cursor on hover
  useCursor(hovered);

  return (
    <mesh
      position={[rect.x + rect.w / 2, rect.y + rect.h / 2, 0]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); setHover(name); }}
      onPointerOut={() => { setHovered(false); setHover(null); }}
      onClick={(e) => { e.stopPropagation(); router.push(to); }}
    >
      {/* Transparent plane as hit area */}
      <planeGeometry args={[rect.w, rect.h]} />
      <meshBasicMaterial transparent opacity={0} />
      {/* Optional: add a faint hover outline using an additive quad slightly in front */}
      {hovered && (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[rect.w * 1.04, rect.h * 1.08]} />
          <meshBasicMaterial color={'#ffd166'} transparent opacity={0.12} />
        </mesh>
      )}
    </mesh>
  );
}

export default function HouseHotspots() {
  // Coordinates below are rough; adjust by eye with devtools:
  // Left (VCs) house rectangle
  const vcs = { x: -520, y: -60, w: 520, h: 580 };
  // Right (FOUNDERS) house rectangle
  const founders = { x: 100, y: -60, w: 580, h: 600 };

  return (
    <group>
      <Hotspot to="/app/vcs" name="vcs" rect={vcs} />
      <Hotspot to="/app/founders" name="founders" rect={founders} />
    </group>
  );
}
