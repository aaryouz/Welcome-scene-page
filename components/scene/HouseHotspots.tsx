'use client';
import { useRouter } from 'next/navigation';
import { useCursor, Html } from '@react-three/drei';
import { useState, useRef } from 'react';
import { useUI } from '@/store/ui';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type HotspotProps = {
  to: string;
  rect: { x: number; y: number; w: number; h: number };
  name: 'vcs' | 'founders';
  label: string;
};

function Hotspot({ to, rect, name, label }: HotspotProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [clicking, setClicking] = useState(false);
  const setHover = useUI((s) => s.setHover);
  const glowRef = useRef<THREE.Mesh>(null!);

  // Change cursor on hover
  useCursor(hovered);

  // Animate glow effect
  useFrame((state) => {
    if (glowRef.current && hovered) {
      const t = state.clock.getElapsedTime();
      // Pulsing glow effect
      const pulse = Math.sin(t * 3) * 0.1 + 0.2;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = pulse;
      }
      // Slight scale animation
      const scale = 1 + Math.sin(t * 2) * 0.02;
      glowRef.current.scale.set(scale, scale, 1);
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClicking(true);

    // Add a brief delay for the animation to show
    setTimeout(() => {
      router.push(to);
    }, 300);
  };

  return (
    <group>
      <mesh
        position={[rect.x + rect.w / 2, rect.y + rect.h / 2, 0.5]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHover(name);
        }}
        onPointerOut={() => {
          setHovered(false);
          setHover(null);
        }}
        onClick={handleClick}
      >
        {/* Transparent plane as hit area */}
        <planeGeometry args={[rect.w, rect.h]} />
        <meshBasicMaterial transparent opacity={0} />

        {/* Animated glow effect on hover */}
        {hovered && (
          <mesh ref={glowRef} position={[0, 0, 0.01]}>
            <planeGeometry args={[rect.w * 1.05, rect.h * 1.05]} />
            <meshBasicMaterial
              color={name === 'vcs' ? '#ffd166' : '#ff6b9d'}
              transparent
              opacity={0.2}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Stronger glow when clicking */}
        {clicking && (
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[rect.w * 1.1, rect.h * 1.1]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </mesh>

      {/* HTML label that appears on hover */}
      {hovered && (
        <Html
          position={[rect.x + rect.w / 2, rect.y + rect.h + 40, 1]}
          center
          distanceFactor={1}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              color: name === 'vcs' ? '#ffd166' : '#ff6b9d',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              whiteSpace: 'nowrap',
              border: `2px solid ${name === 'vcs' ? '#ffd166' : '#ff6b9d'}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function HouseHotspots() {
  const { size } = useThree();

  // Responsive door positions - adjust based on viewport
  // These positions are relative to the center of the screen
  const scale = Math.min(size.width, size.height) / 1080;

  // Left door (VCs) - positioned over the left building's door
  const vcs = {
    x: -size.width * 0.32,
    y: -size.height * 0.15,
    w: 120 * scale,
    h: 180 * scale,
  };

  // Right door (FOUNDERS) - positioned over the right building's door
  const founders = {
    x: size.width * 0.15,
    y: -size.height * 0.15,
    w: 140 * scale,
    h: 200 * scale,
  };

  return (
    <group>
      <Hotspot to="/app/vcs" name="vcs" rect={vcs} label="Enter VCs House" />
      <Hotspot
        to="/app/founders"
        name="founders"
        rect={founders}
        label="Enter Founders House"
      />
    </group>
  );
}
