import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/lib/journey";

const INTERACTIVE = "a, button, [data-cursor-hover]";

/**
 * The site's own cursor: a copper dot with a soft ring that trails it. Over anything clickable
 * the ring swells into a warm glow and the dot melts into it; a click presses it in.
 * The 3D world uses the same pointer as a light. Mouse and pen only; touch keeps its own.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!fine.matches || !root || !ring || !dot) return;

    const html = document.documentElement;
    html.dataset["customCursor"] = "on";
    const reduced = prefersReducedMotion();

    const pointer = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let hovered: Element | null = null;
    let visible = false;
    let raf = 0;
    let last = performance.now();

    const setHover = (next: Element | null) => {
      if (next === hovered) return;
      hovered = next;
      root.dataset["hover"] = hovered ? "true" : "false";
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = reduced ? 1 : 1 - Math.exp(-dt / 0.11);
      trail.x += (pointer.x - trail.x) * k;
      trail.y += (pointer.y - trail.y) * k;
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
      ring.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      if (Math.abs(pointer.x - trail.x) + Math.abs(pointer.y - trail.y) > 0.2) {
        raf = requestAnimationFrame(tick);
      }
    };
    const wake = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!visible) {
        visible = true;
        trail.x = pointer.x;
        trail.y = pointer.y;
        root.dataset["visible"] = "true";
      }
      setHover((event.target as Element | null)?.closest?.(INTERACTIVE) ?? null);
      wake();
    };
    const onDown = () => (root.dataset["pressed"] = "true");
    const onUp = () => (root.dataset["pressed"] = "false");
    const onLeave = () => {
      visible = false;
      root.dataset["visible"] = "false";
    };
    // The element under a still cursor changes as the page scrolls past it.
    const onScroll = () =>
      setHover(document.elementFromPoint(pointer.x, pointer.y)?.closest(INTERACTIVE) ?? null);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    html.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      delete html.dataset["customCursor"];
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      html.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="cursor" aria-hidden="true">
      <div ref={ringRef} className="cursor-ring">
        <span />
      </div>
      <div ref={dotRef} className="cursor-dot">
        <span />
      </div>
    </div>
  );
}
