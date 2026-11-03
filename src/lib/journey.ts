export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
