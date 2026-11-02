import { useEffect } from "react";

import { clamp, journey, prefersReducedMotion } from "@/lib/journey";

/**
 * Drives every scroll-linked effect from one rAF loop by writing CSS custom properties:
 *
 * - `:root`            `--journey` page progress (0 → 1), `--mx` / `--my` pointer (-1 → 1)
 * - `[data-depth]`     `--d` signed distance from the reading zone (≈ -1.5 → 1.5), `--ad` = |d|
 * - `[data-pin]`       `--pin` progress through a sticky container (0 → 1)
 * - `[data-progress]`  `--progress` progress of an element through the viewport (0 → 1)
 *
 * Call it from each page component (not the root) so it starts after that page has
 * hydrated. With reduced motion nothing is written, so the CSS falls back to its static defaults.
 */
export function useJourney() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const root = document.documentElement;
    root.classList.add("journey-ready");

    let depthEls: HTMLElement[] = [];
    let pinEls: HTMLElement[] = [];
    let progressEls: HTMLElement[] = [];
    let dirty = true;
    let frame = 0;
    let lastY = window.scrollY;
    let pointerFrame = 0;

    const scan = () => {
      depthEls = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]"));
      pinEls = Array.from(document.querySelectorAll<HTMLElement>("[data-pin]"));
      progressEls = Array.from(document.querySelectorAll<HTMLElement>("[data-progress]"));
      dirty = false;
    };

    const update = () => {
      frame = 0;
      if (dirty) scan();

      const vh = window.innerHeight;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);

      journey.progress = clamp(y / max);
      journey.velocity = journey.velocity * 0.6 + (y - lastY) * 0.4;
      lastY = y;
      root.style.setProperty("--journey", journey.progress.toFixed(4));

      // The reading zone is the middle 40% of the viewport: elements inside it sit at rest.
      const zoneTop = vh * 0.3;
      const zoneBottom = vh * 0.7;
      for (const el of depthEls) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > vh * 2) continue;
        let d = 0;
        if (rect.top > zoneBottom) d = (rect.top - zoneBottom) / vh;
        else if (rect.bottom < zoneTop) d = (rect.bottom - zoneTop) / vh;
        d = clamp(d, -1.5, 1.5);
        el.style.setProperty("--d", d.toFixed(4));
        el.style.setProperty("--ad", Math.abs(d).toFixed(4));
      }

      for (const el of pinEls) {
        const rect = el.getBoundingClientRect();
        const travel = Math.max(1, rect.height - vh);
        el.style.setProperty("--pin", clamp(-rect.top / travel).toFixed(4));
      }

      for (const el of progressEls) {
        const rect = el.getBoundingClientRect();
        const value = clamp((vh * 0.85 - rect.top) / (rect.height + vh * 0.25));
        el.style.setProperty("--progress", value.toFixed(4));
      }

      // Keep settling the velocity back to zero after scrolling stops.
      if (Math.abs(journey.velocity) > 0.05) schedule();
      else journey.velocity = 0;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const onPointerMove = (event: PointerEvent) => {
      journey.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      journey.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        pointerFrame = 0;
        root.style.setProperty("--mx", journey.pointerX.toFixed(3));
        root.style.setProperty("--my", journey.pointerY.toFixed(3));
      });
    };

    // Route changes and lazy content mount new elements; rescan on the next frame.
    const mutationObserver = new MutationObserver(() => {
      dirty = true;
      schedule();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(pointerFrame);
      mutationObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", onPointerMove);
      root.classList.remove("journey-ready");
    };
  }, []);
}
