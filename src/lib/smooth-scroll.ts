import Lenis from "lenis";

import { prefersReducedMotion } from "@/lib/journey";

/**
 * One inertial scroll for the whole site. The page and the 3D world both read the same eased
 * scroll position, so the camera moves with the page as one gesture instead of catching up.
 * Touch keeps the device's own scrolling; reduced motion keeps the browser's.
 */
let lenis: Lenis | null = null;

export function startSmoothScroll() {
  if (lenis || typeof window === "undefined" || prefersReducedMotion()) return () => {};
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: false });
  let frame = 0;
  const loop = (time: number) => {
    lenis?.raf(time);
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = null;
  };
}

/** True while wheel scrolling is eased, so followers can track it tightly. */
export const smoothScrolling = () => lenis !== null;

/** Scrolls to an element or position through the eased scroll when it runs. */
export function scrollToTarget(target: HTMLElement | number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { immediate, duration: immediate ? 0 : 1.4 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: "instant" });
  else
    target.scrollIntoView({
      behavior: immediate || prefersReducedMotion() ? "auto" : "smooth",
    });
}
