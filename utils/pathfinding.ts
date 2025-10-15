/**
 * Pathfinding utilities for zebra navigation
 */

export type Point = { x: number; y: number };

/**
 * Calculate distance between two points
 */
export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Linear interpolation between two points
 */
export function lerp(start: Point, end: Point, t: number): Point {
  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
  };
}

/**
 * Ease out cubic function for smooth deceleration
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease in out cubic for smooth acceleration and deceleration
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Calculate a smooth path from start to end with slight arc
 * Returns interpolated position based on progress (0-1)
 */
export function calculatePathPosition(
  start: Point,
  end: Point,
  progress: number,
  arcHeight: number = 0
): Point {
  const easedProgress = easeInOutCubic(progress);
  const basePosition = lerp(start, end, easedProgress);

  // Add subtle arc for more natural movement
  if (arcHeight > 0) {
    const arc = Math.sin(easedProgress * Math.PI) * arcHeight;
    basePosition.y += arc;
  }

  return basePosition;
}

/**
 * Calculate the rotation angle to face a target point
 * Returns angle in radians
 */
export function calculateFacingAngle(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}
