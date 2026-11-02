import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { useTilt } from "@/hooks/use-tilt";
import { journey, prefersReducedMotion } from "@/lib/journey";

const FAR = 1800;
const NEAR = 4;
const SPREAD = 1400;
const INTRO_KEY = "farda-intro-seen";

type Star = { x: number; y: number; z: number; tone: number };

// cream, amber, clay — matches the token palette
const TONES = ["255, 246, 218", "255, 164, 0", "232, 132, 108"];

function createStar(z = Math.random() * FAR): Star {
  const roll = Math.random();
  return {
    x: (Math.random() * 2 - 1) * SPREAD,
    y: (Math.random() * 2 - 1) * SPREAD,
    z,
    tone: roll < 0.8 ? 0 : roll < 0.93 ? 1 : 2,
  };
}

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let frame = 0;
    let last = performance.now();
    let camX = 0;
    let camY = 0;
    let speed = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const count = Math.round(Math.min(900, Math.max(260, (width * height) / 2200)));
      stars = Array.from({ length: count }, () => createStar());
      if (reduced) draw(0, 0);
    };

    const draw = (dz: number, roll: number) => {
      const focal = Math.min(width, height) * 0.85;
      const cx = width / 2 + camX;
      const cy = height / 2 + camY;
      const cos = Math.cos(roll);
      const sin = Math.sin(roll);
      const streak = Math.min(Math.abs(dz) * 5, 380) * Math.sign(dz);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";

      for (const star of stars) {
        const rx = star.x * cos - star.y * sin;
        const ry = star.x * sin + star.y * cos;
        const sx = cx + (rx / star.z) * focal;
        const sy = cy + (ry / star.z) * focal;
        if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) continue;

        const near = 1 - star.z / FAR;
        const alpha = Math.min(1, near * near * 1.6);
        const size = 0.35 + near * near * 2.4;
        const color = TONES[star.tone];

        if (Math.abs(streak) > 6) {
          const tz = Math.min(FAR, Math.max(NEAR, star.z + streak));
          ctx.strokeStyle = `rgba(${color}, ${alpha})`;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(cx + (rx / tz) * focal, cy + (ry / tz) * focal);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${color}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const tick = (now: number) => {
      frame = window.requestAnimationFrame(tick);
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;

      journey.boost *= Math.pow(0.94, dt);
      const target = 1.1 + journey.velocity * 0.9 + journey.boost;
      speed += (target - speed) * Math.min(1, 0.12 * dt);
      const dz = speed * dt;

      camX += (-journey.pointerX * width * 0.035 - camX) * 0.05 * dt;
      camY += (-journey.pointerY * height * 0.035 - camY) * 0.05 * dt;

      for (const star of stars) {
        star.z -= dz;
        if (star.z < NEAR) Object.assign(star, createStar(star.z + FAR));
        else if (star.z > FAR) Object.assign(star, createStar(star.z - FAR));
      }

      draw(dz, journey.progress * 0.9);
    };

    const onVisibility = () => {
      window.cancelAnimationFrame(frame);
      if (!document.hidden && !reduced) {
        last = performance.now();
        frame = window.requestAnimationFrame(tick);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}

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

/** Runs before first paint so a returning visitor never sees the intro flash. */
export const introGateScript = `try{if(sessionStorage.getItem("${INTRO_KEY}"))document.documentElement.dataset.introSeen=""}catch(e){}`;

/** The persistent backdrop every route travels through. Mounted once at the root. */
export function JourneyStage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const firstPath = useRef(pathname);

  useTilt();

  // Jump to warp speed whenever the visitor travels to another page.
  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = pathname;
    journey.boost = 42;
  }, [pathname]);

  return (
    <>
      <div className="journey-sky" aria-hidden="true">
        <span className="journey-nebula journey-nebula-a" />
        <span className="journey-nebula journey-nebula-b" />
        <span className="journey-dawn" />
      </div>
      <Starfield />
      <div className="journey-grain" aria-hidden="true" />
      <div className="journey-vignette" aria-hidden="true" />
      <CinematicIntro />
    </>
  );
}
