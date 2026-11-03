import { useEffect } from "react";

import { clamp, prefersReducedMotion } from "@/lib/journey";

/**
 * Drives every scroll-linked effect from one rAF per scroll by writing CSS custom properties:
 *
 * - `[data-journey]`   `--journey` page progress (0 → 1)
 * - `[data-depth]`     `--d` signed distance from the reading zone (≈ -1.5 → 1.5), `--ad` = |d|
 * - `[data-parallax]`  `--d` only, for elements that drift with their own position
 * - `[data-pin]`       `--pin` progress through a sticky container (0 → 1)
 * - `[data-progress]`  `--progress` progress of an element through the viewport (0 → 1)
 *
 * Values are written only onto the elements that read them, never onto :root: custom
 * properties inherit, so a per-frame change on the root would restyle the whole document.
 *
 * Call it from each page component (not the root) so it starts after that page has
 * hydrated. With reduced motion nothing is written, so the CSS falls back to its static defaults.
 */
export function useJourney() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const root = document.documentElement;
    root.classList.add("journey-ready");

    let journeyEls: HTMLElement[] = [];
    let depthEls: HTMLElement[] = [];
    let parallaxEls: HTMLElement[] = [];
    let pinEls: HTMLElement[] = [];
    let progressEls: HTMLElement[] = [];
    let dirty = true;
    let frame = 0;
    // Last value written per element and property, so unchanged values cost nothing.
    const written = new WeakMap<HTMLElement, Record<string, string>>();

    const write = (el: HTMLElement, name: string, value: string) => {
      let values = written.get(el);
      if (!values) written.set(el, (values = {}));
      if (values[name] === value) return;
      values[name] = value;
      el.style.setProperty(name, value);
    };

    const scan = () => {
      journeyEls = Array.from(document.querySelectorAll<HTMLElement>("[data-journey]"));
      depthEls = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]"));
      parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
      pinEls = Array.from(document.querySelectorAll<HTMLElement>("[data-pin]"));
      progressEls = Array.from(document.querySelectorAll<HTMLElement>("[data-progress]"));
      dirty = false;
    };

    const update = () => {
      frame = 0;
      if (dirty) scan();

      const vh = window.innerHeight;
      const max = Math.max(1, root.scrollHeight - vh);
      const journey = clamp(window.scrollY / max).toFixed(4);
      for (const el of journeyEls) write(el, "--journey", journey);

      // Read every rect before writing anything: interleaving reads and style writes
      // would force a style recalc per element.
      const depthRects = depthEls.map((el) => el.getBoundingClientRect());
      const parallaxRects = parallaxEls.map((el) => el.getBoundingClientRect());
      const pinRects = pinEls.map((el) => el.getBoundingClientRect());
      const progressRects = progressEls.map((el) => el.getBoundingClientRect());

      // The reading zone is the middle 40% of the viewport: elements inside it sit at rest.
      const zoneTop = vh * 0.3;
      const zoneBottom = vh * 0.7;
      const distance = (rect: DOMRect) => {
        let d = 0;
        if (rect.top > zoneBottom) d = (rect.top - zoneBottom) / vh;
        else if (rect.bottom < zoneTop) d = (rect.bottom - zoneTop) / vh;
        return clamp(d, -1.5, 1.5);
      };
      const offscreen = (rect: DOMRect) => rect.bottom < -vh || rect.top > vh * 2;
      depthEls.forEach((el, index) => {
        const rect = depthRects[index]!;
        if (offscreen(rect)) return;
        const d = distance(rect);
        write(el, "--d", d.toFixed(3));
        write(el, "--ad", Math.abs(d).toFixed(3));
      });
      parallaxEls.forEach((el, index) => {
        const rect = parallaxRects[index]!;
        if (!offscreen(rect)) write(el, "--d", distance(rect).toFixed(3));
      });

      pinEls.forEach((el, index) => {
        const rect = pinRects[index]!;
        const travel = Math.max(1, rect.height - vh);
        write(el, "--pin", clamp(-rect.top / travel).toFixed(4));
      });

      progressEls.forEach((el, index) => {
        const rect = progressRects[index]!;
        const value = clamp((vh * 0.85 - rect.top) / (rect.height + vh * 0.25));
        write(el, "--progress", value.toFixed(4));
      });
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    // Route changes and lazy content mount new elements; rescan on the next frame.
    const mutationObserver = new MutationObserver(() => {
      dirty = true;
      schedule();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.classList.remove("journey-ready");
    };
  }, []);
}
