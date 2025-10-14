import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';

export function useFitImage(imgWidth: number, imgHeight: number) {
  const { size } = useThree(); // viewport in CSS pixels
  return useMemo(() => {
    const viewAR = size.width / size.height;
    const imgAR = imgWidth / imgHeight;
    // contain: scale so the whole image is visible
    const scale = imgAR > viewAR
      ? size.width / imgWidth
      : size.height / imgHeight;
    // We return world units; with orthographic camera + unit pixel ratio,
    // we can treat 1 world unit ~ 1 CSS pixel for simplicity here.
    return { width: imgWidth * scale, height: imgHeight * scale };
  }, [size.width, size.height, imgWidth, imgHeight]);
}
