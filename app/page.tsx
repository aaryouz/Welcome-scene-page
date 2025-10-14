'use client';
import dynamic from 'next/dynamic';

const CanvasScene = dynamic(() => import('@/components/scene/CanvasScene'), { ssr: false });

export default function Page() {
  return (
    <main className="w-screen h-dvh overflow-hidden bg-black">
      <CanvasScene />
    </main>
  );
}
