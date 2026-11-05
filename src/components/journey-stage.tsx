import { useRouter, useRouterState } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";

import { Cursor } from "@/components/cursor";
import type { WorldMode } from "@/components/foundation-world";
import { prefersReducedMotion } from "@/lib/journey";
import { scrollToTarget, startSmoothScroll } from "@/lib/smooth-scroll";

const FoundationWorld = lazy(() =>
  import("@/components/foundation-world").then((m) => ({ default: m.FoundationWorld })),
);

/** The build phases the world moves through, in the order of the home page. */
export const PHASES = [
  { number: "00", label: "I dag" },
  { number: "01", label: "Strategi" },
  { number: "02", label: "Design" },
  { number: "03", label: "Udvikling" },
  { number: "04", label: "Lancering" },
] as const;

/**
 * Runs before the router starts: a refresh always begins at the top of the page. It forgets the
 * router's saved scroll position for this history entry (keyed by its __TSR_key) and drops a
 * #section from the address, while back/forward navigation keeps restoring where you were.
 * The router re-runs head scripts on every navigation, so it guards itself to run once.
 */
export const freshStartScript = `try{var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"&&!window.__fardaFresh){window.__fardaFresh=1;history.scrollRestoration="manual";var k="tsr-scroll-restoration-v1_3",c=JSON.parse(sessionStorage.getItem(k)||"{}"),h=history.state,p=location.pathname+location.search;if(h)delete c[h.__TSR_key||h.key];sessionStorage.setItem(k,JSON.stringify(c));if(location.hash)history.replaceState(h,"",p)}}catch(e){}`;

function modeFor(pathname: string): WorldMode {
  if (pathname === "/") return { kind: "scroll" };
  if (pathname.startsWith("/work")) return { kind: "rest", phase: 3.55, shift: 0.3 };
  return { kind: "rest", phase: 1.2, shift: 0 };
}

/** The persistent world every route travels through. Mounted once at the root. */
export function JourneyStage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [canMove, setCanMove] = useState(true);
  const fillRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const lastPhase = useRef(-1);

  useEffect(() => {
    setMounted(true);
    setCanMove(!prefersReducedMotion());
  }, []);

  useEffect(() => startSmoothScroll(), []);

  const onPhase = useCallback((t: number) => {
    fillRef.current?.style.setProperty("--build", (t / 4).toFixed(4));
    const index = Math.min(4, Math.round(t));
    if (index !== lastPhase.current && labelRef.current) {
      lastPhase.current = index;
      const phase = PHASES[index]!;
      labelRef.current.textContent = `${phase.number} ${phase.label}`;
    }
  }, []);

  // Opening a new page (a link, not back/forward) starts it at the top. The router resets the
  // scroll itself, but during the page transition the old layout is still settling and it can
  // land a little off the top, so the reset is re-applied once the new page has rendered.
  const router = useRouter();
  useEffect(() => {
    let lastAction = "";
    const stopHistory = router.history.subscribe(({ action }) => (lastAction = action.type));
    const toTop = () => window.requestAnimationFrame(() => scrollToTarget(0, true));
    const stopRendered = router.subscribe("onRendered", ({ toLocation }) => {
      if (lastAction === "PUSH" && !toLocation.hash) toTop();
    });
    const fresh = window as Window & { __fardaFresh?: number };
    if (fresh.__fardaFresh === 1) {
      fresh.__fardaFresh = 2;
      toTop();
    }
    return () => {
      stopHistory();
      stopRendered();
    };
  }, [router]);

  return (
    <>
      <div className="world-fallback" aria-hidden="true" />
      {mounted && (
        <Suspense fallback={null}>
          <FoundationWorld mode={modeFor(pathname)} onPhase={onPhase} paused={paused} />
        </Suspense>
      )}
      <div className="world-scrim" aria-hidden="true" />
      {mounted && <Cursor />}

      <div className="build-hud" hidden={pathname !== "/"}>
        <span className="build-hud-text" aria-hidden="true">
          <span className="build-hud-name">فردا</span>
          <span ref={labelRef}>00 I dag</span>
        </span>
        <span className="build-hud-track" aria-hidden="true">
          <span ref={fillRef} className="build-hud-fill" />
        </span>
        {canMove && (
          <button
            type="button"
            className="build-hud-toggle"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Start animationen" : "Sæt animationen på pause"}
            aria-pressed={paused}
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        )}
      </div>
    </>
  );
}
