import { useEffect, useRef } from "react";
import * as THREE from "three";

import { clamp, prefersReducedMotion } from "@/lib/journey";
import { smoothScrolling } from "@/lib/smooth-scroll";

/**
 * FARDA's world: ~900 blocks that travel the whole site with the visitor.
 *
 *   t = 0  a website, drawn in floating blocks against the night
 *   t = 1  Strategi: the page falls, top to bottom, into a copper blueprint grid
 *   t = 2  Design: the plan rises into a hidden-line drawing of a skyline
 *   t = 3  Udvikling: the buildings turn solid and their windows light up
 *   t = 4  Lancering: the sun rises behind the finished city
 *
 * On the home page t follows the scroll through the `[data-phase]` sections; elsewhere it rests
 * on a fixed phase. Every block is one instance of one box, shaded in a single draw call.
 */

export type WorldMode = { kind: "scroll" } | { kind: "rest"; phase: number; shift: number };

type Props = {
  mode: WorldMode;
  /** Receives the eased phase every frame so the HUD can follow without React re-rendering. */
  onPhase?: (t: number) => void;
  paused: boolean;
};

const GRID = 30;
const CELL = 1;
const COUNT = GRID * GRID;
const GLYPH_Y = 10.5;
/** The last empty plot: two by two cells at the front of the city, where the visitor's
 *  project goes up when they reach the contact section. */
const PLOT = { i: 15, j: 27, x: 1, z: 13 };
const FLOORS = 16;
const FLOOR_H = 0.62;

/* Camera stations, one per phase: position, look-at target, horizontal subject offset. */
const STATIONS = {
  pos: [
    new THREE.Vector3(0, 10, 38),
    new THREE.Vector3(3, 50, 15),
    new THREE.Vector3(-30, 21, 30),
    new THREE.Vector3(36, 12, 33),
    new THREE.Vector3(-6, 3.2, 38),
  ],
  target: [
    new THREE.Vector3(0, 9.6, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 3, 0),
    new THREE.Vector3(0, 4.8, 0),
    new THREE.Vector3(0, 6.5, -12),
  ],
  /** Fraction of the viewport width the subject moves right (desktop only). */
  shift: [0.235, -0.24, 0.27, -0.28, 0.12],
};

const BLOCK_VERTEX = /* glsl */ `
attribute vec3 aGlyph;
attribute vec3 aCell;   // x, z, height
attribute vec3 aSeed;   // random, glyph delay (reading order), radial delay

uniform float uT;
uniform float uTime;
uniform float uIntro;
uniform float uCube;
uniform vec2 uLean;

varying vec3 vLocal;
varying vec3 vSize;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vA;
varying float vC;
varying float vSeed;

float stage(float k, float delay) {
  float spread = 0.75;
  return smoothstep(0.0, 1.0, clamp((uT - k) * (1.0 + spread) - delay * spread, 0.0, 1.0));
}

mat3 rotation(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle), c = cos(angle), oc = 1.0 - c;
  return mat3(
    oc * axis.x * axis.x + c, oc * axis.x * axis.y + axis.z * s, oc * axis.z * axis.x - axis.y * s,
    oc * axis.x * axis.y - axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z + axis.x * s,
    oc * axis.z * axis.x + axis.y * s, oc * axis.y * axis.z - axis.x * s, oc * axis.z * axis.z + c
  );
}

void main() {
  float a = stage(0.0, aSeed.y);   // page → blueprint tile
  float b = stage(1.0, aSeed.z);   // tile → extruded drawing
  float c = stage(2.0, aSeed.z);   // drawing → solid building

  // The stone turns slowly and leans toward the pointer.
  mat3 stone = rotation(vec3(1.0, 0.0, 0.0), 0.42 + uLean.y * 0.4)
    * rotation(vec3(0.0, 1.0, 0.0), 0.75 + uTime * 0.16 + uLean.x * 0.7);
  vec3 stoneCentre = vec3(0.0, ${GLYPH_Y.toFixed(1)}, 0.0);
  vec3 rest = stoneCentre + stone * (aGlyph - stoneCentre);

  // The blocks arrive out of a wide scatter when the page opens.
  vec3 scatter = normalize(vec3(fract(aSeed.x * 91.7) - 0.5, fract(aSeed.x * 47.3) - 0.5, fract(aSeed.x * 13.1) - 0.5) + 1e-3) * (26.0 + aSeed.x * 30.0);
  float intro = smoothstep(0.0, 1.0, clamp(uIntro * 1.6 - aSeed.y * 0.6, 0.0, 1.0));
  vec3 drift = vec3(sin(uTime * 0.7 + aSeed.x * 31.0), cos(uTime * 0.55 + aSeed.x * 17.0), sin(uTime * 0.45 + aSeed.x * 11.0)) * 0.0;
  vec3 glyph = mix(rest + scatter, rest, intro) + drift;

  float h = mix(0.05, aCell.z, b);
  vec3 size = mix(vec3(uCube), vec3(${CELL.toFixed(1)} * 0.84, h, ${CELL.toFixed(1)} * 0.84), a);
  size.y = mix(uCube, h, a);

  vec3 centre = mix(glyph, vec3(aCell.x, size.y * 0.5, aCell.y), a);
  float flight = sin(a * 3.14159);
  centre.y += flight * (3.0 + aSeed.x * 5.0);

  float spin = flight * (aSeed.x - 0.5) * 7.0 + (1.0 - intro) * aSeed.x * 9.0;
  mat3 r = rotation(vec3(aSeed.x - 0.3, 1.0, 0.6 - aSeed.x), spin);

  vec3 world = centre + r * mix(stone * (position * size), position * size, a);
  vLocal = position;
  vSize = size;
  vWorld = world;
  vNormal = r * normalize(mix(stone * normal, normal, a));
  vA = a;
  vC = c;
  vSeed = aSeed.x;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

const BLOCK_FRAGMENT = /* glsl */ `
uniform float uT;
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uFog;
uniform vec3 uCamPos;
uniform float uFogScale;
uniform vec2 uPointerPx;
uniform float uPointerOn;
uniform float uPointerR;

varying vec3 vLocal;
varying vec3 vSize;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vA;
varying float vC;
varying float vSeed;

float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

void main() {
  vec3 cream = vec3(0.93, 0.89, 0.85);
  vec3 copper = vec3(0.86, 0.56, 0.36);
  vec3 ink = vec3(0.035, 0.08, 0.095);
  float dawn = smoothstep(3.0, 4.0, uT);

  // Distance to the nearest box edge, in world units, so lines stay one width on every block.
  vec3 d = (0.5 - abs(vLocal)) * vSize;
  float m1 = min(d.x, min(d.y, d.z));
  float m3 = max(d.x, max(d.y, d.z));
  float m2 = d.x + d.y + d.z - m1 - m3;
  float w = mix(0.03, 0.022, vA);
  float edge = 1.0 - smoothstep(w, w + fwidth(m2) * 1.5, m2);

  // The cursor is a light: near it, edges glow copper and windows switch on.
  float pd = distance(gl_FragCoord.xy, uPointerPx);
  float glow = exp(-(pd * pd) / (uPointerR * uPointerR)) * uPointerOn;

  vec3 n = normalize(vNormal);
  float sun = max(dot(n, normalize(uSunDir)), 0.0);
  float sky = 0.5 + 0.5 * n.y;

  // The stone: one cream cube with a single copper cornerstone, lit from the upper left.
  float key = max(dot(n, normalize(vec3(-0.45, 0.75, 0.55))), 0.0);
  vec3 letter = mix(cream, copper * 1.1, step(0.78, vSeed)) * (0.5 + 0.42 * key + 0.08 * sky);
  letter *= 1.0 - edge * 0.12;

  // The drawing: faces the colour of the night, copper lines.
  vec3 drawing = mix(ink, copper * 1.15, edge);

  // The building: concrete in moonlight, warm at dawn, with lit windows on the sides.
  vec3 concrete = mix(vec3(0.11, 0.17, 0.19), vec3(0.2, 0.25, 0.27), sky);
  concrete += sun * mix(vec3(0.05, 0.08, 0.1), vec3(0.62, 0.38, 0.22), dawn);
  float side = 1.0 - step(0.5, abs(n.y));
  vec2 face = vec2(abs(n.x) > 0.5 ? vWorld.z : vWorld.x, vWorld.y);
  vec2 cellId = floor(face / vec2(0.21, 0.3));
  vec2 cellUv = fract(face / vec2(0.21, 0.3));
  float pane = step(0.22, cellUv.x) * step(cellUv.x, 0.78) * step(0.28, cellUv.y) * step(cellUv.y, 0.74);
  float lit = step(0.62 - 0.5 * glow, hash(cellId + vSeed * 13.0)) * pane * side * step(0.35, vWorld.y);
  // Far windows fall below a pixel and shimmer: fade them to their average glow.
  vec2 fw = fwidth(face / vec2(0.21, 0.3));
  lit = mix(lit, 0.38 * 0.25 * side, smoothstep(0.3, 0.75, max(fw.x, fw.y)));
  vec3 building = concrete + lit * mix(vec3(1.0, 0.72, 0.42), vec3(0.6, 0.45, 0.3), dawn) * (1.0 - dawn * 0.55);
  building = mix(building, copper, edge * 0.18);

  vec3 colour = mix(letter, drawing, vA);
  colour = mix(colour, building, vC);

  // On the stone the light warms the faces; on the plan and the city it traces the edges.
  colour += copper * glow * mix(0.3 + edge * 0.15, 0.06 + edge * 0.9, vA);

  float dist = length(vWorld - uCamPos);
  float fog = smoothstep(30.0 * uFogScale, 95.0 * uFogScale, dist);
  gl_FragColor = vec4(mix(colour, uFog, fog), 1.0);
}
`;

const GROUND_VERTEX = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const GROUND_FRAGMENT = /* glsl */ `
uniform float uT;
uniform float uTime;
uniform vec3 uFog;
uniform vec3 uCamPos;
uniform float uFogScale;
uniform float uBuild;
uniform vec2 uPointerPx;
uniform float uPointerOn;
uniform float uPointerR;
varying vec3 vWorld;

float line(float coord, float width) {
  float g = abs(fract(coord - 0.5) - 0.5);
  return 1.0 - smoothstep(width, width + fwidth(coord) * 1.2, g);
}

void main() {
  vec3 copper = vec3(0.86, 0.56, 0.36);
  float blueprint = smoothstep(0.35, 1.0, uT) * (1.0 - 0.75 * smoothstep(2.2, 3.2, uT));
  float dawn = smoothstep(3.0, 4.0, uT);

  vec2 p = vWorld.xz + 0.5;
  float minor = max(line(p.x, 0.02), line(p.y, 0.02));
  float major = max(line(p.x / 6.0, 0.006), line(p.y / 6.0, 0.006));
  float r = length(vWorld.xz);
  float falloff = 1.0 - smoothstep(18.0, 46.0, r);

  // A scan line sweeps the plan while it is being drawn.
  float scan = exp(-pow((vWorld.x + vWorld.z * 0.4) - (mod(uTime * 7.0, 90.0) - 45.0), 2.0) * 0.08);

  vec3 base = mix(vec3(0.027, 0.065, 0.078), vec3(0.16, 0.14, 0.13), dawn);
  vec3 colour = base + copper * (minor * 0.13 + major * 0.32) * blueprint * falloff;
  colour += copper * scan * blueprint * falloff * 0.35 * (0.4 + minor);

  // The cursor uncovers the plan wherever it goes.
  float pd = distance(gl_FragCoord.xy, uPointerPx);
  float glow = exp(-(pd * pd) / (uPointerR * uPointerR * 1.6)) * uPointerOn;
  colour += copper * (minor * 0.4 + major * 0.7) * glow * falloff;

  // The empty plot waits at dawn: a copper outline and a faint fill, fading as it is built on.
  vec2 q = abs(vWorld.xz - vec2(${PLOT.x.toFixed(1)}, ${PLOT.z.toFixed(1)}));
  float box = max(q.x, q.y) - 1.0;
  float outline = 1.0 - smoothstep(0.035, 0.035 + fwidth(box) * 1.5, abs(box));
  float inside = 1.0 - step(0.0, box);
  float waiting = dawn * (1.0 - 0.75 * uBuild);
  float pulse = 0.75 + 0.25 * sin(uTime * 2.2);
  colour += copper * (outline * 1.4 * pulse + inside * 0.12) * waiting;

  float dist = length(vWorld - uCamPos);
  float fog = smoothstep(26.0 * uFogScale, 110.0 * uFogScale, dist);
  gl_FragColor = vec4(mix(colour, uFog, fog), 1.0);
}
`;

const TOWER_VERTEX = /* glsl */ `
attribute float aFloor;
uniform float uBuild;
varying vec3 vLocal;
varying vec3 vSize;
varying vec3 vWorld;
varying float vFloor;
varying float vFresh;

void main() {
  // Floors are set one after another, each dropping into place from above.
  float placed = uBuild * ${(FLOORS + 2).toFixed(1)} - aFloor;
  float p = smoothstep(0.0, 1.0, clamp(placed, 0.0, 1.0));
  vec3 size = vec3(1.72, ${(FLOOR_H - 0.07).toFixed(2)}, 1.72) * mix(0.0, 1.0, step(0.001, p));
  size.xz *= mix(0.82, 1.0, p);
  vec3 centre = vec3(${PLOT.x.toFixed(1)}, ${(FLOOR_H / 2).toFixed(2)} + aFloor * ${FLOOR_H.toFixed(2)}, ${PLOT.z.toFixed(1)});
  centre.y += (1.0 - p) * 2.6;
  vec3 world = centre + position * size;
  vLocal = position;
  vSize = max(size, vec3(1e-3));
  vWorld = world;
  vFloor = aFloor;
  vFresh = 1.0 - clamp(placed - 1.0, 0.0, 1.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

const TOWER_FRAGMENT = /* glsl */ `
uniform float uGlow;
uniform float uTime;
uniform vec3 uFog;
uniform vec3 uCamPos;
uniform float uFogScale;
varying vec3 vLocal;
varying vec3 vSize;
varying vec3 vWorld;
varying float vFloor;
varying float vFresh;

float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

void main() {
  vec3 copper = vec3(0.92, 0.6, 0.38);
  vec3 warm = vec3(1.0, 0.78, 0.5);

  vec3 d = (0.5 - abs(vLocal)) * vSize;
  float m1 = min(d.x, min(d.y, d.z));
  float m3 = max(d.x, max(d.y, d.z));
  float m2 = d.x + d.y + d.z - m1 - m3;
  float edge = 1.0 - smoothstep(0.025, 0.025 + fwidth(m2) * 1.5, m2);

  // Ribbon windows along each floor; more of them light while the visitor is about to write.
  bool side = abs(vLocal.y) < 0.499;
  float u = abs(vLocal.x) > 0.499 ? vLocal.z : vLocal.x;
  float pane = step(0.18, fract(u * 6.0)) * step(abs(vLocal.y), 0.28);
  float id = hash(vec2(floor(u * 6.0), vFloor));
  float lit = side ? pane * step(id, 0.42 + 0.58 * uGlow) : 0.0;

  vec3 glass = vec3(0.07, 0.11, 0.12) + copper * 0.06;
  vec3 colour = glass + warm * lit * (0.75 + 0.35 * uGlow);
  colour = mix(colour, copper * 1.25, edge * (0.85 + 0.15 * uGlow));
  // A floor glows as it lands.
  colour += copper * 0.55 * vFresh * (0.4 + edge);

  float fog = smoothstep(30.0 * uFogScale, 95.0 * uFogScale, length(vWorld - uCamPos));
  gl_FragColor = vec4(mix(colour, uFog, fog * 0.6), 1.0);
}
`;

const SKY_VERTEX = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz - cameraPosition);
  vec4 clip = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  gl_Position = clip.xyww;
}
`;

const SKY_FRAGMENT = /* glsl */ `
uniform float uT;
uniform float uTime;
uniform vec3 uSunDir;
varying vec3 vDir;

float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }

void main() {
  vec3 dir = normalize(vDir);
  float e = dir.y;
  float dawn = smoothstep(3.0, 4.0, uT);

  vec3 nightTop = vec3(0.02, 0.05, 0.065);
  vec3 nightLow = vec3(0.06, 0.14, 0.165);
  vec3 dawnTop = vec3(0.13, 0.22, 0.27);
  vec3 dawnLow = vec3(0.96, 0.64, 0.42);

  float lift = smoothstep(-0.05, 0.55, e);
  vec3 colour = mix(mix(nightLow, nightTop, lift), mix(dawnLow, dawnTop, pow(lift, 0.7)), dawn);

  vec3 sunDir = normalize(uSunDir);
  float toSun = max(dot(dir, sunDir), 0.0);
  colour += vec3(1.0, 0.62, 0.36) * pow(toSun, 9.0) * 0.55 * dawn;
  colour = mix(colour, vec3(1.0, 0.8, 0.52), smoothstep(0.99955, 0.99975, toSun) * dawn);

  // Stars, fading out as the sun comes up.
  vec3 cell = floor(dir * 220.0);
  float star = step(0.9965, hash(cell)) * smoothstep(0.02, 0.3, e);
  float twinkle = 0.6 + 0.4 * sin(uTime * 1.7 + hash(cell + 3.0) * 40.0);
  colour += vec3(0.93, 0.89, 0.85) * star * twinkle * (1.0 - dawn) * 0.85;

  gl_FragColor = vec4(colour, 1.0);
}
`;

/* -------------------------------------------------------------------------- */

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stacks the blocks into one cube, 10 x 9 x 10, centred where the hero's subject sits. One
 *  corner block is the copper cornerstone (seed above 0.78); every other seed stays below. */
function buildStone(count: number, random: () => number) {
  const nx = 10;
  const ny = 9;
  const nz = 10;
  const pitch = 0.64;
  const out = new Float32Array(count * 3);
  const order = new Float32Array(count);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const x = i % nx;
    const z = Math.floor(i / nx) % nz;
    const y = Math.floor(i / (nx * nz)) % ny;
    out[i * 3] = (x - (nx - 1) / 2) * pitch;
    out[i * 3 + 1] = GLYPH_Y + (y - (ny - 1) / 2) * pitch;
    out[i * 3 + 2] = (z - (nz - 1) / 2) * pitch;
    // The stone comes apart from the top down.
    order[i] = (1 - y / (ny - 1)) * 0.8 + random() * 0.2;
    seed[i] = x === 0 && y === 0 && z === nz - 1 ? 0.9 : random() * 0.77;
  }
  return { positions: out, order, seed, cube: pitch * 0.965 };
}

function buildCity(random: () => number) {
  const cells = new Float32Array(COUNT * 3);
  const radial = new Float32Array(COUNT);
  const half = (GRID - 1) / 2;
  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      const k = i * GRID + j;
      const x = (i - half) * CELL;
      const z = (j - half) * CELL;
      const plot = (i === PLOT.i || i === PLOT.i + 1) && (j === PLOT.j || j === PLOT.j + 1);
      const street = plot || i % 6 === 2 || j % 6 === 2;
      const dist = Math.hypot(x, z);
      const r = random();
      const tower = 0.5 + Math.pow(r, 2.4) * 4.2 + 8.5 * Math.exp(-(dist * dist) / 70) * (0.45 + r);
      cells[k * 3] = x;
      cells[k * 3 + 1] = z;
      cells[k * 3 + 2] = street ? 0.05 : dist > 15.5 ? Math.min(tower, 1.2) : tower;
      radial[k] = Math.min(1, dist / (half * 1.42));
    }
  }
  return { cells, radial };
}

/* -------------------------------------------------------------------------- */

export function FoundationWorld({ mode, onPhase, paused }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const pausedRef = useRef(paused);
  const phaseRef = useRef(onPhase);
  modeRef.current = mode;
  pausedRef.current = paused;
  phaseRef.current = onPhase;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    void (async () => {
      if (disposed) return;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          powerPreference: "high-performance",
        });
      } catch {
        document.documentElement.dataset["world"] = "off";
        return;
      }
      const reduced = prefersReducedMotion();
      const small = window.matchMedia("(max-width: 800px)");
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, small.matches ? 1.5 : 1.75));
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 400);
      const posCurve = new THREE.CatmullRomCurve3(STATIONS.pos, false, "centripetal");
      const targetCurve = new THREE.CatmullRomCurve3(STATIONS.target, false, "centripetal");

      const random = mulberry(20261105);
      const glyph = buildStone(COUNT, random);
      const city = buildCity(random);

      const seeds = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        seeds[i * 3] = glyph.seed[i]!;
        seeds[i * 3 + 1] = glyph.order[i]!;
        seeds[i * 3 + 2] = city.radial[i]! * 0.8 + random() * 0.2;
      }

      const shared = {
        uT: { value: 0 },
        uTime: { value: 0 },
        uIntro: { value: reduced ? 1 : 0 },
        uCube: { value: glyph.cube },
        uSunDir: { value: new THREE.Vector3(0.1, 0.05, -1) },
        uFog: { value: new THREE.Color(0.05, 0.12, 0.145) },
        uCamPos: { value: camera.position },
        uFogScale: { value: 1 },
        uBuild: { value: 0 },
        uGlow: { value: 0 },
        uLean: { value: new THREE.Vector2() },
        uPointerPx: { value: new THREE.Vector2(-9999, -9999) },
        uPointerOn: { value: 0 },
        uPointerR: { value: 160 },
      };

      const box = new THREE.BoxGeometry(1, 1, 1);
      const geometry = new THREE.InstancedBufferGeometry();
      geometry.index = box.index;
      geometry.setAttribute("position", box.getAttribute("position"));
      geometry.setAttribute("normal", box.getAttribute("normal"));
      geometry.setAttribute("aGlyph", new THREE.InstancedBufferAttribute(glyph.positions, 3));
      geometry.setAttribute("aCell", new THREE.InstancedBufferAttribute(city.cells, 3));
      geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 3));
      geometry.instanceCount = COUNT;

      const blocks = new THREE.Mesh(
        geometry,
        new THREE.ShaderMaterial({
          vertexShader: BLOCK_VERTEX,
          fragmentShader: BLOCK_FRAGMENT,
          uniforms: shared,
        }),
      );
      blocks.frustumCulled = false;
      scene.add(blocks);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(260, 260),
        new THREE.ShaderMaterial({
          vertexShader: GROUND_VERTEX,
          fragmentShader: GROUND_FRAGMENT,
          uniforms: shared,
        }),
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const sky = new THREE.Mesh(
        new THREE.SphereGeometry(200, 32, 16),
        new THREE.ShaderMaterial({
          vertexShader: SKY_VERTEX,
          fragmentShader: SKY_FRAGMENT,
          uniforms: shared,
          side: THREE.BackSide,
          depthWrite: false,
        }),
      );
      sky.renderOrder = -1;
      scene.add(sky);

      const floorIndex = new Float32Array(FLOORS).map((_, i) => i);
      const towerGeometry = new THREE.InstancedBufferGeometry();
      towerGeometry.index = box.index;
      towerGeometry.setAttribute("position", box.getAttribute("position"));
      towerGeometry.setAttribute("aFloor", new THREE.InstancedBufferAttribute(floorIndex, 1));
      towerGeometry.instanceCount = FLOORS;
      const tower = new THREE.Mesh(
        towerGeometry,
        new THREE.ShaderMaterial({
          vertexShader: TOWER_VERTEX,
          fragmentShader: TOWER_FRAGMENT,
          uniforms: shared,
        }),
      );
      tower.frustumCulled = false;
      scene.add(tower);

      /* Hovering the mail action lights the new building. */
      let glowOn = false;
      const onGlow = (event: Event) => {
        glowOn = Boolean((event as CustomEvent<boolean>).detail);
        wake();
      };
      window.addEventListener("farda:glow", onGlow);

      /* Scroll → phase -------------------------------------------------------- */
      let sections: { top: number; height: number }[] = [];
      const measure = () => {
        sections = Array.from(document.querySelectorAll<HTMLElement>("[data-phase]"))
          .sort((x, y) => Number(x.dataset["phase"]) - Number(y.dataset["phase"]))
          .map((el) => {
            const rect = el.getBoundingClientRect();
            return { top: rect.top + window.scrollY, height: rect.height };
          });
      };
      const scrollPhase = () => {
        if (sections.length < 2) return 0;
        const y = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        // Phase i is reached exactly when section i's top meets the top of the screen, and the
        // world travels the whole way between two sections, so every pixel of scroll moves it.
        const anchor = (i: number) => (i === 0 ? 0 : Math.min(sections[i]!.top, maxScroll));
        for (let i = 0; i < sections.length - 1; i++) {
          const from = anchor(i);
          const to = anchor(i + 1);
          if (y < to) {
            const f = clamp((y - from) / Math.max(1, to - from));
            // A soft ease at both ends lets each phase settle as its section lines up.
            return i + f * f * (3 - 2 * f);
          }
        }
        return sections.length - 1;
      };

      /* Size ------------------------------------------------------------------ */
      let width = 0;
      let height = 0;
      const resize = () => {
        width = host.clientWidth;
        height = host.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        measure();
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resizeObserver.observe(document.body);

      /* Pointer --------------------------------------------------------------- */
      const pointer = {
        x: 0,
        y: 0,
        sx: 0,
        sy: 0,
        px: -9999,
        py: -9999,
        lx: -9999,
        ly: -9999,
        on: 0,
      };
      const onPointer = (event: PointerEvent) => {
        pointer.x = event.clientX / window.innerWidth - 0.5;
        pointer.y = event.clientY / window.innerHeight - 0.5;
        // Only a mouse or pen carries the light; a finger on glass has nothing to hover.
        pointer.on = event.pointerType === "touch" ? 0 : 1;
        pointer.px = event.clientX;
        pointer.py = event.clientY;
        if (pointer.lx < -999) {
          pointer.lx = pointer.px;
          pointer.ly = pointer.py;
        }
      };
      const onLeave = () => {
        pointer.on = 0;
        wake();
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);

      /* Loop ------------------------------------------------------------------ */
      const target = () => {
        const m = modeRef.current;
        return m.kind === "rest" ? m.phase : scrollPhase();
      };
      let t = target();
      let time = 0;
      let last = performance.now();
      let frame = 0;
      const look = new THREE.Vector3();
      const sun = shared.uSunDir.value;

      const render = (now: number) => {
        frame = 0;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        // Idle motion (drift, sway, twinkle) only plays on the home page journey.
        const moving = !reduced && !pausedRef.current && modeRef.current.kind === "scroll";

        const goal = target();
        t = reduced
          ? goal
          : t + (goal - t) * (1 - Math.exp(-dt / (smoothScrolling() ? 0.12 : 0.3)));
        if (Math.abs(goal - t) < 1e-4) t = goal;
        if (moving) time += dt;
        if (!reduced) shared.uIntro.value = Math.min(1, shared.uIntro.value + dt / 2.6);

        const u = clamp(t / (STATIONS.pos.length - 1));
        posCurve.getPoint(u, camera.position);
        targetCurve.getPoint(u, look);

        pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt / 0.6));
        pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt / 0.6));
        // The light trails the cursor a touch, like a lamp on a string.
        const follow = reduced ? 1 : 1 - Math.exp(-dt / 0.07);
        pointer.lx += (pointer.px - pointer.lx) * follow;
        pointer.ly += (pointer.py - pointer.ly) * follow;
        const ratio = renderer.getPixelRatio();
        shared.uPointerPx.value.set(pointer.lx * ratio, (height - pointer.ly) * ratio);
        shared.uPointerR.value = 170 * ratio;
        shared.uPointerOn.value +=
          (pointer.on - shared.uPointerOn.value) * (reduced ? 1 : 1 - Math.exp(-dt / 0.25));
        if (Math.abs(pointer.on - shared.uPointerOn.value) < 1e-3)
          shared.uPointerOn.value = pointer.on;
        shared.uLean.value.set(pointer.sx, pointer.sy);
        if (moving) {
          camera.position.x += pointer.sx * 2.2 + Math.sin(time * 0.12) * 0.6;
          camera.position.y += -pointer.sy * 1.2;
        }
        // The camera eases in from further back as the page assembles.
        camera.position.z += (1 - shared.uIntro.value) * 12 * (1 - u);
        // Narrow screens step back so the page and the city still fit across.
        const aspect = width / Math.max(1, height);
        const heroLeft = 1 - clamp(t);
        let back = aspect < 1.25 ? Math.pow(1.25 / aspect, 0.85) : 1;
        // On a phone the page steps further back during the hero, above the headline.
        if (small.matches) back *= 1 + 0.05 * heroLeft;
        if (back !== 1) camera.position.sub(look).multiplyScalar(back).add(look);
        shared.uFogScale.value = back;
        camera.lookAt(look);

        const i0 = Math.floor(clamp(t, 0, 3.999));
        const frac = t - i0;
        let shift = THREE.MathUtils.lerp(STATIONS.shift[i0]!, STATIONS.shift[i0 + 1]!, frac);
        let lift = 0;
        const m = modeRef.current;
        if (m.kind === "rest") shift = m.shift;
        if (small.matches) {
          shift = 0;
          lift = 0.16 + 0.07 * heroLeft;
        }
        camera.setViewOffset(width, height, -shift * width, lift * height, width, height);
        camera.updateProjectionMatrix();

        const arrived = modeRef.current.kind === "scroll";
        const build = shared.uBuild;
        // The tower rises with the scroll through the last stretch, floor by floor.
        build.value = arrived ? THREE.MathUtils.smoothstep(t, 3.3, 3.95) : 0;
        const glowGoal = glowOn ? 1 : 0;
        shared.uGlow.value +=
          (glowGoal - shared.uGlow.value) * (reduced ? 1 : 1 - Math.exp(-dt / 0.22));
        if (Math.abs(glowGoal - shared.uGlow.value) < 1e-3) shared.uGlow.value = glowGoal;

        const dawn = THREE.MathUtils.smoothstep(t, 3, 4);
        sun.set(0.06, THREE.MathUtils.lerp(-0.12, 0.085, dawn), -1);
        (shared.uFog.value as THREE.Color).setRGB(
          THREE.MathUtils.lerp(0.05, 0.62, dawn),
          THREE.MathUtils.lerp(0.12, 0.44, dawn),
          THREE.MathUtils.lerp(0.145, 0.34, dawn),
        );
        shared.uT.value = t;
        shared.uTime.value = time;
        renderer.render(scene, camera);
        phaseRef.current?.(t);

        // Sleep once nothing moves; scroll, resize, pointer and play wake it again.
        const settled =
          !moving &&
          t === goal &&
          shared.uIntro.value >= 1 &&
          shared.uGlow.value === glowGoal &&
          Math.abs(pointer.x - pointer.sx) + Math.abs(pointer.y - pointer.sy) < 1e-3 &&
          Math.abs(pointer.px - pointer.lx) + Math.abs(pointer.py - pointer.ly) < 0.5 &&
          shared.uPointerOn.value === pointer.on;
        if (!document.hidden && !settled) frame = requestAnimationFrame(render);
      };

      const wake = () => {
        if (!frame && !document.hidden) {
          last = performance.now();
          frame = requestAnimationFrame(render);
        }
      };
      const onScroll = () => wake();
      const onResize = () => {
        measure();
        wake();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      window.addEventListener("pointermove", wake, { passive: true });
      window.addEventListener("farda:world", onResize);
      document.addEventListener("visibilitychange", wake);
      wake();
      host.dataset["ready"] = "true";

      cleanup = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", wake);
        window.removeEventListener("farda:world", onResize);
        window.removeEventListener("pointermove", onPointer);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", wake);
        geometry.dispose();
        box.dispose();
        ground.geometry.dispose();
        sky.geometry.dispose();
        towerGeometry.dispose();
        (tower.material as THREE.Material).dispose();
        window.removeEventListener("farda:glow", onGlow);
        (blocks.material as THREE.Material).dispose();
        (ground.material as THREE.Material).dispose();
        (sky.material as THREE.Material).dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  // Route changes and play/pause re-measure the sections and wake the loop.
  const modeKey = mode.kind === "rest" ? `rest:${mode.phase}` : "scroll";
  useEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event("farda:world")));
    return () => cancelAnimationFrame(id);
  }, [modeKey, paused]);

  return <div ref={hostRef} className="world" aria-hidden="true" />;
}
