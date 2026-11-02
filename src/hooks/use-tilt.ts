import { useEffect } from "react";

import { prefersReducedMotion } from "@/lib/journey";

/**
 * Pointer-driven 3D tilt for any `[data-tilt]` element, via one delegated listener.
 * Writes `--rx` / `--ry` (degrees) and `--gx` / `--gy` (glare position, %) on the element.
 */
export function useTilt() {
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) return;

    let active: HTMLElement | null = null;
    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const reset = (el: HTMLElement) => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.removeAttribute("data-tilting");
    };

    const apply = () => {
      frame = 0;
      if (!active || !lastEvent) return;
      const rect = active.getBoundingClientRect();
      const x = (lastEvent.clientX - rect.left) / rect.width;
      const y = (lastEvent.clientY - rect.top) / rect.height;
      const strength = Number(active.dataset["tilt"] || 8);
      active.style.setProperty("--ry", `${((x - 0.5) * strength * 2).toFixed(2)}deg`);
      active.style.setProperty("--rx", `${((0.5 - y) * strength * 2).toFixed(2)}deg`);
      active.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      active.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      active.setAttribute("data-tilting", "");
    };

    const onMove = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (target !== active) {
        if (active) reset(active);
        active = target;
      }
      lastEvent = event;
      if (active && !frame) frame = window.requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (active) reset(active);
      active = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);
}
