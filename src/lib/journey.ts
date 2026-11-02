// Shared, non-React state for the scroll journey. Written by the scroll engine and
// the pointer listener, read every frame by the starfield canvas.
export const journey = {
  /** 0 → 1 across the whole document. */
  progress: 0,
  /** Smoothed scroll velocity in px per frame (signed). */
  velocity: 0,
  /** Extra forward speed, used for the warp jump between routes. Decays over time. */
  boost: 0,
  /** Pointer position, -1 → 1 from the viewport centre. */
  pointerX: 0,
  pointerY: 0,
};

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
