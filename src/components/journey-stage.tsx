import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { useTilt } from "@/hooks/use-tilt";

const INTRO_KEY = "farda-intro-seen";

function CinematicIntro() {
  useEffect(() => {
    try {
      window.sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // Storage can be unavailable (private mode); the intro simply plays again.
    }
  }, []);

  return (
    <div className="cine-intro" aria-hidden="true">
      <span className="cine-intro-bar cine-intro-bar-top" />
      <span className="cine-intro-bar cine-intro-bar-bottom" />
      <div className="cine-intro-title">
        <span className="cine-intro-mark">FARDA</span>
        <span className="cine-intro-sub">Rejsen mod i morgen</span>
      </div>
    </div>
  );
}

/**
 * Runs before the router starts: a refresh always begins at the top of the page. It forgets the
 * router's saved scroll position for this history entry (keyed by its __TSR_key) and drops a
 * #section from the address, while back/forward navigation keeps restoring where you were.
 * The router re-runs head scripts on every navigation, so it guards itself to run once.
 */
export const freshStartScript = `try{var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"&&!window.__fardaFresh){window.__fardaFresh=1;history.scrollRestoration="manual";var k="tsr-scroll-restoration-v1_3",c=JSON.parse(sessionStorage.getItem(k)||"{}"),h=history.state,p=location.pathname+location.search;if(h)delete c[h.__TSR_key||h.key];sessionStorage.setItem(k,JSON.stringify(c));if(location.hash)history.replaceState(h,"",p)}}catch(e){}`;

/** Runs before first paint so a returning visitor never sees the intro flash. */
export const introGateScript = `try{if(sessionStorage.getItem("${INTRO_KEY}"))document.documentElement.dataset.introSeen=""}catch(e){}`;

/** The persistent backdrop every route travels through. Mounted once at the root. */
export function JourneyStage() {
  useTilt();

  // Opening a new page (a link, not back/forward) starts it at the top. The router resets the
  // scroll itself, but during the page transition the old layout is still settling and it can
  // land a little off the top, so the reset is re-applied once the new page has rendered.
  const router = useRouter();
  useEffect(() => {
    let lastAction = "";
    const stopHistory = router.history.subscribe(({ action }) => (lastAction = action.type));
    const toTop = () =>
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const stopRendered = router.subscribe("onRendered", ({ toLocation }) => {
      if (lastAction === "PUSH" && !toLocation.hash) toTop();
    });
    // Same for a refresh (flagged by freshStartScript), once the page has hydrated.
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
      <div className="journey-sky" aria-hidden="true">
        <span className="journey-nebula journey-nebula-a" />
        <span className="journey-nebula journey-nebula-b" />
        <span className="journey-dawn" data-journey />
        <span className="journey-horizon" data-journey />
      </div>
      <div className="journey-vignette" aria-hidden="true" />
      <CinematicIntro />
    </>
  );
}
