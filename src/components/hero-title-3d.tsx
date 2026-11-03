import { useEffect, useRef } from "react";

import { clamp, prefersReducedMotion } from "@/lib/journey";

const FOV = (34 * Math.PI) / 180;
const CAMERA_Z = 10;
/** Seconds the blocks take to lay down the title when the page opens. */
const ASSEMBLE_SECONDS = 1.8;
/**
 * The destruction follows the scroll with an eased glide (time constant, seconds) and never
 * plays faster than MIN_DESTRUCTION_SECONDS end to end, so a fast flick or a phone swipe still
 * plays out smoothly instead of flashing past.
 */
const FOLLOW_SECONDS = 0.3;
const MIN_DESTRUCTION_SECONDS = 1.6;
/** Destruction progress at which a held scroll is released and continues to the next chapter. */
const RELEASE_AT = 0.85;
/** Floats per block instance: position xyz, colour rgb, random direction xyz, sweep order. */
const STRIDE = 10;

const CREAM: Rgb = [0.91, 0.871, 0.843];
// The dawn gradient used by TOMORROW in CSS (--dawn-gradient): copper → sand → copper.
const DAWN: [number, Rgb][] = [
  [0, [0.71, 0.533, 0.388]],
  [0.55, [0.827, 0.765, 0.725]],
  [1, [0.71, 0.533, 0.388]],
];

type Rgb = [number, number, number];

// Canvas only takes font-stretch keywords; map the computed percentage onto them.
const STRETCH: [number, CanvasFontStretch][] = [
  [62.5, "extra-condensed"],
  [75, "condensed"],
  [87.5, "semi-condensed"],
  [100, "normal"],
  [112.5, "semi-expanded"],
  [125, "expanded"],
];
function stretchKeyword(computed: string): CanvasFontStretch {
  const percent = parseFloat(computed) || 100;
  return STRETCH.reduce((best, entry) =>
    Math.abs(entry[0] - percent) < Math.abs(best[0] - percent) ? entry : best,
  )[1];
}

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec3 aPos;
in vec3 aNormal;
in vec3 iPos;
in vec3 iColor;
in vec4 iRand;

uniform mat4 uViewProj;
uniform mat3 uSpin;
uniform vec3 uPivot;
uniform vec3 uSize;
uniform float uBreak;
uniform float uAssemble;
uniform float uTime;
uniform float uHalfWidth;

out vec3 vNormal;
out vec3 vColor;
out vec3 vLocal;
out float vFade;
out float vWave;

mat3 axisAngle(vec3 axis, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  float k = 1.0 - c;
  return mat3(
    c + axis.x * axis.x * k, axis.y * axis.x * k + axis.z * s, axis.z * axis.x * k - axis.y * s,
    axis.x * axis.y * k - axis.z * s, c + axis.y * axis.y * k, axis.z * axis.y * k + axis.x * s,
    axis.x * axis.z * k + axis.y * s, axis.y * axis.z * k - axis.x * s, c + axis.z * axis.z * k
  );
}

void main() {
  // iRand.w sweeps left → right. Scrolling blows the title away in that order; on load the
  // blocks land in the same order, so the title is laid down from the left.
  float sweep = iRand.w;
  float blown = smoothstep(sweep * 0.7, sweep * 0.7 + 0.3, uBreak);
  float arriving = smoothstep((1.0 - sweep) * 0.7, (1.0 - sweep) * 0.7 + 0.3, uAssemble);
  float t = max(blown, arriving);
  float r = fract(iRand.x * 43.7 + iRand.y * 17.3);

  // Dust in the wind: up, to the right and towards the camera, with a little curl.
  vec3 wind = normalize(vec3(0.55, 0.45, 0.6) + iRand.xyz * 0.9);
  vec3 curl = vec3(sin(t * 6.0 + iRand.x * 6.0), cos(t * 5.0 + iRand.y * 6.0), 0.0) * 0.08 * t;
  vec3 offset = wind * t * t * (1.4 + r * 2.2) + curl;
  mat3 tumble = axisAngle(normalize(iRand.xyz + vec3(0.0001)), t * (3.0 + r * 4.0));

  // Blocks touch at rest; gaps open as the title cracks, then each one shrinks as it blows away.
  float crack = smoothstep(0.0, 0.12, uBreak);
  vec3 local = tumble * (aPos * uSize * (1.0 - t * 0.55) * mix(1.0, 0.86, crack));
  // Idle: a soft wave of light loops through the letters without a pause (as one leaves on the
  // right the next enters on the left), lifting the blocks it passes towards the camera. It
  // fades out as soon as the title starts to break.
  float idle = (1.0 - uAssemble) * (1.0 - crack);
  float across = (iPos.x - uPivot.x) / uHalfWidth * 0.5 + 0.5;
  float wave = pow(0.5 + 0.5 * cos(6.2831853 * (across - uTime * 0.9)), 6.0) * idle;
  offset.z += wave * uSize.z * 2.2;

  vec3 world = uPivot + uSpin * (iPos - uPivot + offset + local);

  vNormal = uSpin * tumble * aNormal;
  vColor = iColor;
  vLocal = aPos * 2.0;
  vFade = 1.0 - smoothstep(0.7, 1.0, t);
  vWave = wave;
  gl_Position = uViewProj * vec4(world, 1.0);
}`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vColor;
in vec3 vLocal;
in float vFade;
in float vWave;

uniform float uBreak;

out vec4 outColor;

void main() {
  vec3 n = normalize(vNormal);
  float facing = max(n.z, 0.0);
  float diffuse = max(dot(n, normalize(vec3(-0.45, 0.7, 0.55))), 0.0);

  // Faces towards the camera carry the letter colour; the extruded sides fall into shade.
  vec3 color = vColor * (0.28 + facing * 0.62 + diffuse * 0.22);

  // Seams between blocks: barely there at rest, opening up as the title starts to break.
  vec3 a = abs(vLocal);
  float second = a.x + a.y + a.z - max(max(a.x, a.y), a.z) - min(min(a.x, a.y), a.z);
  color *= 1.0 - smoothstep(0.82, 0.98, second) * (0.06 + smoothstep(0.0, 0.15, uBreak) * 0.3);

  // The wave catches the light as it passes: a warm sand glint that reads on both words.
  color = mix(color, vec3(0.96, 0.88, 0.8) * (0.75 + facing * 0.35), vWave * 0.6);

  outColor = vec4(color * vFade, vFade);
}`;

// A unit cube (-0.5 → 0.5) as 36 vertices with flat normals: [x, y, z, nx, ny, nz].
function cubeVertices() {
  const faces: [Rgb, Rgb, Rgb][] = [
    [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    [
      [-1, 0, 0],
      [0, 0, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ],
    [
      [0, -1, 0],
      [1, 0, 0],
      [0, 0, 1],
    ],
    [
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, -1],
      [0, 1, 0],
      [1, 0, 0],
    ],
  ];
  const data: number[] = [];
  for (const [n, u, w] of faces) {
    const corner = (su: number, sw: number) =>
      [0, 1, 2].map((i) => n[i]! * 0.5 + u[i]! * su * 0.5 + w[i]! * sw * 0.5);
    for (const p of [
      corner(-1, -1),
      corner(1, -1),
      corner(1, 1),
      corner(-1, -1),
      corner(1, 1),
      corner(-1, 1),
    ]) {
      data.push(...p, ...n);
    }
  }
  return new Float32Array(data);
}

function dawnColor(u: number): Rgb {
  for (let i = 1; i < DAWN.length; i++) {
    const [end, to] = DAWN[i]!;
    const [begin, from] = DAWN[i - 1]!;
    if (u <= end) {
      const k = (u - begin) / (end - begin);
      return [0, 1, 2].map((c) => from[c]! + (to[c]! - from[c]!) * k) as Rgb;
    }
  }
  return DAWN[DAWN.length - 1]![1];
}

type Sample = { blocks: Float32Array; size: number; pivot: Rgb; halfWidth: number };

/**
 * Rasterises each title word with its real font, exactly where the DOM lays it out, and returns
 * one block per filled grid cell, in world units on the z = 0 plane the camera looks at.
 */
function sampleTitle(words: HTMLElement[], canvas: HTMLCanvasElement, unitsPerPx: number): Sample {
  const canvasRect = canvas.getBoundingClientRect();
  const fontSize = parseFloat(getComputedStyle(words[0]!).fontSize);
  const step = Math.max(3, Math.round(fontSize / 44));
  const data: number[] = [];
  const toWorld = (x: number, y: number): [number, number] => [
    (x - canvasRect.width / 2) * unitsPerPx,
    (canvasRect.height / 2 - y) * unitsPerPx,
  ];
  let minX = Infinity;
  let maxX = -Infinity;

  words.forEach((word, wordIndex) => {
    const rect = word.getBoundingClientRect();
    const style = getComputedStyle(word);
    const text = word.textContent ?? "";
    const ink = document.createElement("canvas");
    ink.width = Math.ceil(rect.width);
    ink.height = Math.ceil(rect.height);
    const ctx = ink.getContext("2d", { willReadFrequently: true });
    if (!ctx || !ink.width || !ink.height) return;

    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fontStretch = stretchKeyword(style.fontStretch);
    ctx.letterSpacing = style.letterSpacing;
    const metrics = ctx.measureText(text);
    // Match the DOM: same baseline within the line box, same total advance width.
    const ascent = metrics.fontBoundingBoxAscent;
    const descent = metrics.fontBoundingBoxDescent;
    const baseline = (rect.height - (ascent + descent)) / 2 + ascent;
    ctx.scale(rect.width / Math.max(1, metrics.width), 1);
    ctx.fillText(text, 0, baseline);

    const pixels = ctx.getImageData(0, 0, ink.width, ink.height).data;
    const isGradient = wordIndex > 0;
    for (let y = Math.floor(step / 2); y < ink.height; y += step) {
      for (let x = Math.floor(step / 2); x < ink.width; x += step) {
        if (pixels[(y * ink.width + x) * 4 + 3]! < 128) continue;
        const [wx, wy] = toWorld(rect.left - canvasRect.left + x, rect.top - canvasRect.top + y);
        const color = isGradient ? dawnColor(x / ink.width) : CREAM;
        data.push(
          wx,
          wy,
          0,
          ...color,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          0,
        );
        minX = Math.min(minX, wx);
        maxX = Math.max(maxX, wx);
      }
    }
  });

  // Sweep order: mostly left → right, with some randomness so it erodes rather than wipes.
  for (let i = 0; i < data.length; i += STRIDE) {
    const across = (data[i]! - minX) / Math.max(0.0001, maxX - minX);
    data[i + 9] = clamp(across * 0.75 + Math.random() * 0.25);
  }

  const titleRect = words[0]!.parentElement!.parentElement!.getBoundingClientRect();
  const [px, py] = toWorld(
    titleRect.left - canvasRect.left + titleRect.width / 2,
    titleRect.top - canvasRect.top + titleRect.height / 2,
  );
  return {
    blocks: new Float32Array(data),
    size: step * unitsPerPx,
    pivot: [px, py, 0],
    halfWidth: Math.max(0.0001, (maxX - minX) / 2),
  };
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed to compile");
  }
  return shader;
}

/** Column-major perspective × view matrix for a camera at (0, 0, CAMERA_Z) looking down -z. */
function viewProjection(aspect: number) {
  const f = 1 / Math.tan(FOV / 2);
  const near = 0.1;
  const far = 60;
  const depth = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * depth, -1,
    0, 0, 2 * far * near * depth - (far + near) * depth * CAMERA_Z, CAMERA_Z,
  ]);
}

/** Rotation about y (yaw), then x (pitch), as a column-major mat3. */
function spinMatrix(yaw: number, pitch: number) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cx = Math.cos(pitch);
  const sx = Math.sin(pitch);
  // prettier-ignore
  return new Float32Array([cy, sx * sy, -cx * sy, 0, cx, sx, sy, -sx * cy, cx * cy]);
}

/**
 * Renders the hero title as 3D blocks that are laid down on load and blown away like dust as
 * the hero scrolls; at rest a soft wave of light runs through them. The real <h1> stays in
 * the DOM for layout, screen readers and as the fallback. Pure WebGL2, one instanced draw.
 */
export function HeroTitle3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>("[data-pin]");
    const title = hero?.querySelector<HTMLElement>(".hero-title");
    const words = hero ? Array.from(hero.querySelectorAll<HTMLElement>(".hero-word > span")) : [];
    if (!canvas || !hero || !title || words.length === 0 || prefersReducedMotion()) return;
    const gl = canvas.getContext("webgl2", { antialias: true, premultipliedAlpha: true });
    if (!gl) return;

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    } catch {
      return;
    }
    gl.useProgram(program);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const attribute = (
      name: string,
      size: number,
      stride: number,
      offset: number,
      divisor: number,
    ) => {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride * 4, offset * 4);
      gl.vertexAttribDivisor(location, divisor);
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices(), gl.STATIC_DRAW);
    attribute("aPos", 3, 6, 0, 0);
    attribute("aNormal", 3, 6, 3, 0);
    const instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
    attribute("iPos", 3, STRIDE, 0, 1);
    attribute("iColor", 3, STRIDE, 3, 1);
    attribute("iRand", 4, STRIDE, 6, 1);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uViewProj = uniform("uViewProj");
    const uSpin = uniform("uSpin");
    const uPivot = uniform("uPivot");
    const uSize = uniform("uSize");
    const uBreak = uniform("uBreak");
    const uAssemble = uniform("uAssemble");
    const uTime = uniform("uTime");
    const uHalfWidth = uniform("uHalfWidth");

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let blockCount = 0;
    let frame = 0;
    let visible = true;
    let pin = -1;
    let start = 0;
    let lastNow = 0;
    let disposed = false;
    let resizeTimer = 0;
    // How far the next chapter overlaps the end of the hero (its negative margin-top, in px).
    let overlap = 0;
    let heroTop = 0;
    let heroHeight = 0;
    // The gate: scrolling can't pass the end of the hero until the destruction has played.
    // `held` while the page is stopped there; `continueAfter` when the visitor was scrolling on.
    let held = false;
    let continueAfter = false;
    // In-page anchor jumps (nav links) and arriving on a #hash skip the gate.
    let bypassUntil = window.location.hash ? performance.now() + 2500 : 0;
    // The gate only reacts to the visitor's own scrolling (wheel, touch, keys, and the momentum
    // that follows), never to the router restoring a position or other programmatic jumps.
    let lastInput = -Infinity;
    const onInput = () => (lastInput = performance.now());
    const root = document.documentElement;
    const next = hero.nextElementSibling as HTMLElement | null;
    // The first visit plays the letterbox intro first; land the title as it opens.
    const assembleDelay = document.documentElement.dataset["introSeen"] === undefined ? 0.8 : 0.1;

    // Rebuilds the blocks from the current layout. data-gl-title switches off the DOM title's own
    // CSS motion, so its untransformed box can be measured; the blocks then stand in for it.
    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      hero.dataset["glTitle"] = "";
      title.style.opacity = "0";
      overlap = next ? Math.max(0, -parseFloat(getComputedStyle(next).marginTop) || 0) : 0;
      // The hero doesn't move within the page, so measure it once per layout instead of every
      // frame (a per-frame measurement forces the browser to recalculate layout mid-frame).
      heroTop = hero.getBoundingClientRect().top + window.scrollY;
      heroHeight = hero.offsetHeight;

      const unitsPerPx = (2 * CAMERA_Z * Math.tan(FOV / 2)) / Math.max(1, canvas.clientHeight);
      const sample = sampleTitle(words, canvas, unitsPerPx);
      blockCount = sample.blocks.length / STRIDE;
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, sample.blocks, gl.STATIC_DRAW);
      gl.uniformMatrix4fv(
        uViewProj,
        false,
        viewProjection(canvas.clientWidth / Math.max(1, canvas.clientHeight)),
      );
      gl.uniform3f(uPivot, ...sample.pivot);
      gl.uniform1f(uHalfWidth, sample.halfWidth);
      // Blocks fill their cell so the letters read as solid; the depth gives them their extrusion.
      gl.uniform3f(uSize, sample.size, sample.size, sample.size * 1.8);
    };

    const draw = (now: number) => {
      const elapsed = (now - start) / 1000;
      const target = clamp((window.scrollY - heroTop) / gateOffset());
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      if (pin < 0 || now < bypassUntil) {
        // First frame (e.g. a reload mid-page) and nav-link jumps: follow the page directly, so
        // the title is fully gone by the time a jump lands on its section.
        pin = target;
      } else {
        const eased = (target - pin) * (1 - Math.exp(-dt / FOLLOW_SECONDS));
        const limit = dt / MIN_DESTRUCTION_SECONDS;
        pin += clamp(eased, -limit, limit);
        if (Math.abs(target - pin) < 0.0005) pin = target;
      }
      if (held && pin >= RELEASE_AT) release();

      const assemble = 1 - clamp((elapsed - assembleDelay) / ASSEMBLE_SECONDS);
      // Idle motion starts once the title has landed: a slow sway that shows the letters' depth.
      const settled = Math.max(0, elapsed - assembleDelay - ASSEMBLE_SECONDS);
      const sway = Math.min(1, settled / 1.5);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(uBreak, clamp(pin / 0.95));
      gl.uniform1f(uAssemble, assemble);
      gl.uniform1f(uTime, settled);
      gl.uniformMatrix3fv(
        uSpin,
        false,
        spinMatrix(
          Math.sin(settled * 0.7) * 0.07 * sway + pin * 0.35,
          Math.sin(settled * 0.5) * 0.035 * sway + pin * 0.2,
        ),
      );
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, blockCount);
    };

    // Animates continuously, but only while the hero is on screen and the tab is visible.
    const tick = (now: number) => {
      draw(now);
      frame = window.requestAnimationFrame(tick);
    };
    const run = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      if (visible && !document.hidden && blockCount) frame = window.requestAnimationFrame(tick);
    };

    // Scroll distance from the top of the hero to the gate: the point where the next chapter's
    // top reaches the bottom of the screen. The destruction spans exactly this distance.
    const gateOffset = () => Math.max(1, heroHeight - overlap - window.innerHeight);

    const blockScroll = (event: Event) => event.preventDefault();
    const hold = () => {
      if (held) return;
      held = true;
      root.style.overflow = "hidden";
      window.addEventListener("wheel", blockScroll, { passive: false });
      window.addEventListener("touchmove", blockScroll, { passive: false });
    };
    const unlock = () => {
      held = false;
      root.style.overflow = "";
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
    };
    // Lets the page go again; a visitor who was scrolling on is carried into the next chapter.
    const release = () => {
      unlock();
      if (continueAfter && next) {
        continueAfter = false;
        window.scrollTo({
          top: next.getBoundingClientRect().top + window.scrollY,
          behavior: "smooth",
        });
      }
    };

    const onScroll = () => {
      const now = performance.now();
      if (held || pin < 0 || pin >= RELEASE_AT || now < bypassUntil || now - lastInput > 1500)
        return;
      const gate = heroTop + gateOffset();
      if (window.scrollY <= gate + 1) return;
      continueAfter = true;
      window.scrollTo({ top: gate, behavior: "instant" });
      hold();
      run();
    };
    const onAnchorClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest('a[href^="#"]')) {
        bypassUntil = performance.now() + 2500;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      run();
    });

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        layout();
        run();
      }, 150);
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      window.cancelAnimationFrame(frame);
      unlock();
      delete hero.dataset["glTitle"];
      title.style.opacity = "";
    };

    // Sample only once the real font has loaded, or the blocks would spell the fallback font.
    void document.fonts.ready.then(() => {
      if (disposed) return;
      layout();
      start = performance.now();
      observer.observe(canvas);
      run();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    for (const type of ["wheel", "touchmove", "keydown"]) {
      window.addEventListener(type, onInput, { passive: true });
    }
    document.addEventListener("click", onAnchorClick, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", run);
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      for (const type of ["wheel", "touchmove", "keydown"]) {
        window.removeEventListener(type, onInput);
      }
      document.removeEventListener("click", onAnchorClick, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", run);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      unlock();
      delete hero.dataset["glTitle"];
      title.style.opacity = "";
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />;
}
