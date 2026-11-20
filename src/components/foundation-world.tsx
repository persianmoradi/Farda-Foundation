import { useEffect, useRef } from "react";
import * as THREE from "three";

import spkCard from "@/assets/spk-case-card.webp";
import uvmCard from "@/assets/uvm-card.webp";
import { clamp, prefersReducedMotion } from "@/lib/journey";
import { smoothScrolling } from "@/lib/smooth-scroll";

/**
 * FARDA's world: one website, pulled apart into glass sheets, put together while the visitor
 * scrolls through how FARDA works.
 *
 *   t = 0  the empty sheets hang apart in the dark, lit only at their edges
 *   t = 1  Strategi: the bottom sheet carries the wireframe and sitemap, annotated in copper
 *   t = 2  Design: colour, type and components (nav, buttons, the real case cards) fill in
 *   t = 3  Udvikling: a code sheet slides in, a cursor tries the button, the sheets close up
 *   t = 4  Lancering: the sheets press into one finished page that glows in the dawn
 *
 * On the home page t follows the scroll through the `[data-phase]` sections; elsewhere it rests
 * on a fixed phase. Every sheet is a thin box with one shader: its UI is drawn once to a canvas
 * at load, revealed by a sweep, and lit as cheap glass (edge light, fresnel, a soft studio
 * reflection). Depth of field is a mip bias per sheet, so the whole scene is six draw calls.
 */

export type WorldMode = { kind: "scroll" } | { kind: "rest"; phase: number; shift: number };

type Props = {
  mode: WorldMode;
  /** Receives the eased phase every frame so the HUD can follow without React re-rendering. */
  onPhase?: (t: number) => void;
  paused: boolean;
};

/* The page, drawn in CSS pixels of a 1440 × 900 desktop and shown 8 × 5 units in the world. */
const PX = { w: 1440, h: 900 };
const PAGE = { w: 8, h: 5 };
const CODE = { w: 806, h: 720 };
const THICK = 0.05;
/** Where the hero's "Kontakt FARDA" button sits, in page pixels. */
const CTA = { x: 178, y: 548 };

/* Per phase: how far apart the sheets hang, how the stack is turned, and how large it is. */
const GAPS = [1.45, 1.3, 1.1, 0.75, 0] as const;
const TURN = [
  [-0.95, 0.6, 0.34],
  [-1.08, -0.5, -0.3],
  [-0.66, 0.52, 0.18],
  [-0.44, -0.6, -0.1],
  [-0.06, -0.32, 0],
] as const;
const SIZE = [1, 0.96, 0.68, 0.94, 0.98] as const;

/* Camera stations, one per phase: position, look-at target, horizontal subject offset. */
const STATIONS = {
  pos: [
    new THREE.Vector3(1.5, 2.2, 23),
    new THREE.Vector3(-1, 3.5, 22),
    new THREE.Vector3(1.5, 1.6, 22),
    new THREE.Vector3(-1.5, 1.2, 22),
    new THREE.Vector3(0.8, 0.4, 21),
  ],
  target: [
    new THREE.Vector3(0, 0.3, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.1, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ],
  /** Fraction of the viewport width the subject moves right (desktop only). */
  shift: [0.235, -0.24, 0.32, -0.28, 0.2],
};

/* Palette (CSS tokens) and how each sheet's edge is lit. */
const INK = "#ece4dc";
const INK_2 = "rgba(236, 228, 220, 0.74)";
const INK_3 = "rgba(236, 228, 220, 0.56)";
const NIGHT = "#081419";
const COPPER = "#d39466";
const COPPER_2 = "#e7b086";
const TEAL = "#86bdb3";
const SANS = 'Geist, "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO = '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace';
const FARSI = 'Vazirmatn, "Geeza Pro", "Noto Naskh Arabic", sans-serif';
const RIMS = [0xd39466, 0x7fb5b8, 0xd9d2c8, 0x86bdb3];

const SHEET_VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;
varying float vSide;
void main() {
  vUv = uv;
  vSide = 1.0 - step(0.5, abs(normal.z));
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPos = world.xyz;
  vNormal = mat3(modelMatrix) * normal;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

/** Premultiplied output: the drawn UI over a faint glass body, with the light added on top. */
const SHEET_FRAGMENT = /* glsl */ `
uniform sampler2D uMap;
uniform vec2 uSize;
uniform float uShow;
uniform float uFill;
uniform float uGhost;
uniform float uBlur;
uniform float uBright;
uniform float uBody;
uniform float uLift;
uniform vec3 uRim;
uniform vec3 uHover;
uniform vec3 uKey;
uniform vec2 uPointerPx;
uniform float uPointerOn;
uniform float uPointerR;
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;
varying float vSide;

void main() {
  vec3 V = normalize(cameraPosition - vPos);
  vec3 N = normalize(vNormal);
  float fres = pow(1.0 - abs(dot(N, V)), 2.0);
  float pd = distance(gl_FragCoord.xy, uPointerPx);
  float near = exp(-(pd * pd) / (uPointerR * uPointerR)) * uPointerOn;
  vec4 colour;
  if (vSide > 0.5) {
    // The cut edge of the acrylic catches the light.
    colour = vec4(uRim * (0.8 + 1.4 * fres + 1.6 * near), 1.0) * 0.9;
  } else {
    vec2 p = (vUv - 0.5) * uSize;
    vec2 q = abs(p) - uSize * 0.5 + 0.14;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.14;
    float inside = 1.0 - smoothstep(-fwidth(d), 0.0, d);
    float rim = exp(d * 26.0);
    // The UI draws on from the top left.
    float order = 0.35 * vUv.x + 0.65 * (1.0 - vUv.y);
    float drawn = max(smoothstep(order, order + 0.22, uFill * 1.22), uGhost);
    vec4 ui = texture2D(uMap, vUv, uBlur) * drawn;
    float body = uBody * (0.4 + 0.6 * fres);
    // A soft box light above, reflected in the sheet as it turns.
    float soft = pow(max(dot(reflect(-V, N), uKey), 0.0), 18.0);
    vec2 h = (vUv - uHover.xy) * uSize;
    vec3 light = uRim * (rim * 0.6 + 0.1 * fres + near * (0.18 + rim))
      + vec3(0.85, 0.92, 1.0) * soft * 0.16
      + vec3(0.83, 0.5, 0.3) * uHover.z * exp(-dot(h, h) * 9.0);
    colour.rgb = ui.rgb * uLift + vec3(0.025, 0.07, 0.08) * body * (1.0 - ui.a) + light * (1.0 - 0.5 * ui.a);
    colour.a = ui.a + body * (1.0 - ui.a);
    colour *= inside;
  }
  colour.rgb *= uBright;
  gl_FragColor = colour * uShow;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** The studio: night teal, a soft pool of light behind the subject, warming to dawn. */
const BACKDROP_VERTEX = /* glsl */ `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const BACKDROP_FRAGMENT = /* glsl */ `
uniform vec2 uRes;
uniform vec2 uCentre;
uniform float uDawn;
uniform float uHalo;
uniform float uPool;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 night = mix(vec3(0.0052, 0.0194, 0.0262), vec3(0.0015, 0.0048, 0.0065), smoothstep(0.0, 1.0, uv.y));
  vec3 dawn = mix(vec3(0.22, 0.1, 0.06), vec3(0.024, 0.037, 0.051), smoothstep(0.0, 0.85, uv.y));
  vec3 colour = mix(night, dawn, uDawn);
  vec2 d = (gl_FragCoord.xy - uCentre) / uRes.y;
  float r = dot(d, d);
  colour += mix(vec3(0.012, 0.04, 0.046), vec3(0.06, 0.035, 0.02), uDawn) * exp(-r * 4.0) * uPool;
  colour += vec3(0.75, 0.38, 0.17) * exp(-r * 7.0) * uHalo;
  colour += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(colour, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* Drawing the sheets ------------------------------------------------------------------------ */

type Ctx = CanvasRenderingContext2D;

function text(
  ctx: Ctx,
  value: string,
  x: number,
  y: number,
  font: string,
  colour: string,
  spacing = 0,
  align: CanvasTextAlign = "left",
) {
  ctx.font = font;
  ctx.fillStyle = colour;
  ctx.letterSpacing = `${spacing}px`;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
  return ctx.measureText(value).width;
}

function pill(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string | null,
  edge?: string,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (edge) {
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

/** The bottom sheet: grid, grey boxes, a sitemap and the copper notes of the strategy. */
function drawWire(ctx: Ctx) {
  const box = (x: number, y: number, w: number, h: number, r = 6) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = "rgba(236, 228, 220, 0.11)";
    ctx.fill();
    ctx.strokeStyle = "rgba(236, 228, 220, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };
  const line = (points: number[], colour: string, width = 1.5) => {
    ctx.beginPath();
    ctx.moveTo(points[0]!, points[1]!);
    for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i]!, points[i + 1]!);
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.stroke();
  };
  const note = (x1: number, y1: number, x2: number, y2: number, label: string) => {
    line([x1, y1, x2, y2], COPPER);
    ctx.beginPath();
    ctx.arc(x1, y1, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = COPPER;
    ctx.fill();
    text(ctx, label, x2 + 8, y2 + 4, `500 12px ${MONO}`, COPPER_2, 1.2);
  };

  const column = (1264 - 11 * 24) / 12;
  ctx.fillStyle = "rgba(211, 148, 102, 0.1)";
  for (let i = 0; i < 12; i++) ctx.fillRect(88 + i * (column + 24), 0, column, PX.h);
  ctx.setLineDash([6, 6]);
  for (const y of [72, 612, 740]) line([0, y, PX.w, y], "rgba(236, 228, 220, 0.22)", 1);
  ctx.setLineDash([]);

  box(88, 24, 112, 24);
  for (const [x, w] of [
    [964, 52],
    [1032, 52],
    [1100, 84],
  ] as const)
    box(x, 28, w, 16, 4);
  box(1214, 20, 138, 40, 20);
  [560, 500, 600, 440].forEach((w, i) => box(88, 150 + i * 68, w, 54));
  [500, 520, 300].forEach((w, i) => box(88, 440 + i * 24, w, 12, 3));
  box(88, 524, 180, 48, 24);
  box(284, 524, 124, 48, 24);
  for (const x of [88, 260, 432]) {
    box(x, 640, 96, 10, 3);
    box(x, 660, 130, 22, 4);
  }
  for (const x of [760, 1072]) {
    box(x, 140, 280, 330, 14);
    box(x + 12, 152, 256, 170, 6);
    line([x + 12, 152, x + 268, 322], "rgba(236, 228, 220, 0.2)", 1);
    line([x + 268, 152, x + 12, 322], "rgba(236, 228, 220, 0.2)", 1);
    [150, 190, 236, 200, 80].forEach((w, i) => box(x + 20, 342 + i * 24, w, i === 1 ? 18 : 10, 3));
  }

  // The sitemap, in the footer band.
  text(ctx, "SITEMAP", 88, 792, `500 12px ${MONO}`, COPPER_2, 1.5);
  text(ctx, "5 sider · 2 cases", 88, 814, `400 12px ${MONO}`, INK_3, 0.5);
  const node = (x: number, y: number, w: number, label: string) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, 24, 5);
    ctx.fillStyle = "rgba(8, 20, 25, 0.9)";
    ctx.fill();
    ctx.strokeStyle = COPPER;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    text(ctx, label, x + w / 2, y + 16, `400 11px ${MONO}`, INK, 0.5, "center");
  };
  line([720, 784, 720, 798, 480, 798, 480, 812], COPPER, 1.2);
  for (const x of [630, 780, 930]) line([x, 798, x, 812], COPPER, 1.2);
  line([720, 798, 930, 798], COPPER, 1.2);
  line([630, 836, 630, 846, 583, 846, 583, 856], COPPER, 1.2);
  line([630, 846, 679, 846, 679, 856], COPPER, 1.2);
  node(680, 760, 80, "/");
  node(430, 812, 100, "/#priser");
  node(580, 812, 100, "/#cases");
  node(730, 812, 100, "/#om");
  node(880, 812, 100, "/#kontakt");
  node(540, 856, 86, "/work/spk");
  node(636, 856, 86, "/work/uvm");

  // Notes from the strategy.
  line([88, 100, 1352, 100], COPPER, 1);
  for (const x of [88, 1352]) line([x, 94, x, 106], COPPER, 1);
  ctx.fillStyle = "rgba(8, 20, 25, 1)";
  ctx.fillRect(600, 92, 240, 16);
  text(ctx, "12 KOL · 24 GUTTER · 1440", 720, 104, `500 12px ${MONO}`, COPPER_2, 1.2, "center");
  note(648, 177, 690, 126, "H1 · GEIST 500 · 72/0.95");
  note(408, 548, 440, 548, "CTA → #KONTAKT");
  note(1212, 470, 1212, 500, "CASES × 2");
  line([730, 618, 730, 734], COPPER, 1);
  for (const y of [618, 734]) line([724, y, 736, y], COPPER, 1);
  text(ctx, "128", 742, 680, `500 12px ${MONO}`, COPPER_2, 1);
}

/** The colour and type sheet: the page itself, with the real headline. */
function drawSurface(ctx: Ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, PX.w, PX.h, 22);
  ctx.clip();
  const base = ctx.createLinearGradient(0, 0, 0, PX.h);
  base.addColorStop(0, "#071216");
  base.addColorStop(0.6, "#0b1d23");
  base.addColorStop(1, "#10262d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, PX.w, PX.h);
  const warm = ctx.createRadialGradient(1180, 980, 0, 1180, 980, 760);
  warm.addColorStop(0, "rgba(211, 148, 102, 0.3)");
  warm.addColorStop(1, "rgba(211, 148, 102, 0)");
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, PX.w, PX.h);
  ctx.fillStyle = "rgba(236, 228, 220, 0.1)";
  ctx.fillRect(0, 72, PX.w, 1);
  ctx.fillRect(88, 612, 612, 1);
  ctx.fillRect(88, 740, 1264, 1);

  const h1 = `500 62px ${SANS}`;
  ["Websites og", "webapps til", "virksomheder, der"].forEach((line, i) =>
    text(ctx, line, 88, 198 + i * 68, h1, INK, -1.9),
  );
  let x = 88 + text(ctx, "bygger til ", 88, 402, h1, INK, -1.9);
  x += text(ctx, "i morgen", x, 402, h1, COPPER, -1.9);
  text(ctx, ".", x, 402, h1, INK, -1.9);
  text(
    ctx,
    "FARDA er et AI-native konsulenthus i København. Du arbejder",
    88,
    452,
    `400 18px ${SANS}`,
    INK_2,
  );
  text(
    ctx,
    "direkte med den, der designer og koder din løsning.",
    88,
    478,
    `400 18px ${SANS}`,
    INK_2,
  );
  for (const [sx, label, value] of [
    [88, "WEBSITES FRA", "3.500 kr."],
    [260, "SVAR INDEN FOR", "24 timer"],
    [432, "SPROG", "Dansk · Engelsk"],
  ] as const) {
    text(ctx, label, sx, 652, `400 11px ${MONO}`, INK_3, 1.5);
    text(ctx, value, sx, 684, `400 22px ${SANS}`, INK);
  }
  text(ctx, "FARDA · AI-NATIVE KONSULENTHUS · KØBENHAVN", 88, 792, `400 12px ${MONO}`, INK_3, 1.5);
  text(ctx, "farda.dk", 1352, 792, `400 12px ${MONO}`, INK_3, 1.5, "right");
  ctx.restore();
}

/** The component sheet: navigation, buttons and the two real case cards. */
function drawParts(ctx: Ctx, images: (HTMLImageElement | null)[]) {
  const logo = text(ctx, "FARDA", 88, 44, `600 17px ${SANS}`, INK, 3.4);
  text(ctx, "فردا", 88 + logo + 12, 45, `800 18px ${FARSI}`, COPPER);
  for (const [lx, label] of [
    [964, "Priser"],
    [1032, "Cases"],
    [1100, "Om FARDA"],
  ] as const)
    text(ctx, label, lx, 41, `400 15px ${SANS}`, INK_2);
  pill(ctx, 1214, 20, 138, 40, COPPER);
  text(ctx, "Kontakt FARDA", 1283, 45, `500 15px ${SANS}`, NIGHT, 0, "center");
  pill(ctx, 88, 524, 180, 48, COPPER);
  text(ctx, "Kontakt FARDA  →", CTA.x, 554, `500 16px ${SANS}`, NIGHT, 0, "center");
  pill(ctx, 284, 524, 124, 48, null, "rgba(236, 228, 220, 0.34)");
  text(ctx, "Se priserne", 346, 554, `500 16px ${SANS}`, INK, 0, "center");

  const cards = [
    [
      "01 — WEBDESIGN · UDVIKLING",
      "SPK Støtte",
      "En rolig, tillidsfuld platform for",
      "faglige metoder og støtteforløb.",
    ],
    [
      "02 — PRODUKTDESIGN · AI",
      "Ministeriets AI-Platform",
      "En AI-læringsplatform til danske",
      "ungdomsuddannelser.",
    ],
  ] as const;
  cards.forEach(([meta, title, a, b], i) => {
    const x = 760 + i * 312;
    ctx.beginPath();
    ctx.roundRect(x, 140, 280, 330, 14);
    ctx.fillStyle = "rgba(12, 28, 34, 0.97)";
    ctx.fill();
    ctx.strokeStyle = "rgba(236, 228, 220, 0.16)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, 140, 280, 190, [14, 14, 0, 0]);
    ctx.clip();
    const image = images[i];
    if (image) {
      const s = Math.max(280 / image.naturalWidth, 190 / image.naturalHeight);
      const w = image.naturalWidth * s;
      const h = image.naturalHeight * s;
      ctx.drawImage(image, x + (280 - w) / 2, 140 + (190 - h) / 2, w, h);
    } else {
      ctx.fillStyle = "#1a3038";
      ctx.fill();
    }
    ctx.restore();
    text(ctx, meta, x + 20, 356, `400 10.5px ${MONO}`, INK_3, 1);
    text(ctx, title, x + 20, 388, `500 20px ${SANS}`, INK, -0.3);
    text(ctx, a, x + 20, 414, `400 13px ${SANS}`, INK_2);
    text(ctx, b, x + 20, 432, `400 13px ${SANS}`, INK_2);
    text(ctx, "Se casen ↗", x + 20, 458, `500 13px ${SANS}`, COPPER_2);
  });
}

const SOURCE = [
  'import { Button, Cases } from "@/components";',
  "",
  "export function Hero() {",
  "  return (",
  '    <section className="hero" data-phase={0}>',
  '      <h1 className="display">',
  "        Websites og webapps til virksomheder,",
  "        der bygger til <em>i morgen</em>.",
  "      </h1>",
  '      <Button href="#kontakt" tone="copper">',
  "        Kontakt FARDA",
  "      </Button>",
  "      <Cases items={cases} />",
  "    </section>",
  "  );",
  "}",
  "",
  "/* styles.css */",
  ".display {",
  "  font: 500 clamp(2.5rem, 6vw, 4.5rem)/0.95 Geist;",
  "  letter-spacing: -0.03em;",
  "}",
  ".display em { color: var(--copper); }",
];
/** Comments, strings, keywords, JSX tags, attributes and properties, values. */
const TOKEN =
  /(\/\*.*?\*\/)|("[^"]*")|\b(import|from|export|function|return)\b|(<\/?[A-Za-z]\w*|\/?>)|([\w-]+)(?==|:\s)|(--[\w-]+|\b\d[\w.]*)/g;
const TOKEN_COLOURS = [INK_3, COPPER_2, COPPER, TEAL, INK_2, COPPER_2];

/** The code sheet: an editor with the hero's JSX and CSS, coloured in the site's palette. */
function drawCode(ctx: Ctx) {
  ctx.beginPath();
  ctx.roundRect(0, 0, CODE.w, CODE.h, 18);
  ctx.fillStyle = "rgba(5, 13, 16, 0.94)";
  ctx.fill();
  ctx.strokeStyle = "rgba(236, 228, 220, 0.16)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "rgba(236, 228, 220, 0.08)";
  ctx.fillRect(0, 48, CODE.w, 1);
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.arc(26 + i * 18, 24, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(236, 228, 220, 0.22)";
    ctx.fill();
  });
  text(ctx, "hero.tsx", 100, 29, `500 13px ${MONO}`, INK);
  ctx.fillStyle = COPPER;
  ctx.fillRect(96, 46, 72, 2);
  text(ctx, "styles.css", 196, 29, `400 13px ${MONO}`, INK_3);

  const font = `400 15px ${MONO}`;
  SOURCE.forEach((line, i) => {
    const y = 84 + i * 26;
    text(ctx, String(i + 1), 40, y, font, "rgba(236, 228, 220, 0.28)", 0, "right");
    let x = 60;
    let at = 0;
    for (const match of line.matchAll(TOKEN)) {
      const index = match.index ?? 0;
      x += text(ctx, line.slice(at, index), x, y, font, INK);
      const group = match.slice(1).findIndex((g) => g !== undefined);
      const token = match[group + 1] ?? match[0];
      x += text(ctx, token, x, y, font, TOKEN_COLOURS[group] ?? INK);
      at = index + token.length;
    }
    text(ctx, line.slice(at), x, y, font, INK);
  });
}

/** The cursor that tries the finished button. */
function drawCursor(ctx: Ctx) {
  ctx.translate(8, 8);
  ctx.scale(2.6, 2.6);
  ctx.beginPath();
  for (const [x, y] of [
    [0, 0],
    [0, 17],
    [4.5, 13],
    [7.5, 19.5],
    [10, 18.5],
    [7, 12.4],
    [13, 12.4],
  ])
    ctx.lineTo(x!, y!);
  ctx.closePath();
  ctx.fillStyle = INK;
  ctx.fill();
  ctx.strokeStyle = NIGHT;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function sheetCanvas(w: number, h: number, scale: number, draw: (ctx: Ctx) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(scale, scale);
    ctx.textBaseline = "alphabetic";
    draw(ctx);
  }
  return canvas;
}

/** The site's fonts and the two case images, waited on for at most a moment. */
async function loadAssets() {
  const image = (src: string) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    return img.decode().then(
      () => img,
      () => null,
    );
  };
  const fonts = Promise.allSettled([
    document.fonts.load(`500 62px ${SANS}`),
    document.fonts.load(`400 15px ${MONO}`),
    document.fonts.load(`500 12px ${MONO}`),
    document.fonts.load(`800 18px ${FARSI}`, "فردا"),
  ]);
  const [images] = await Promise.all([
    Promise.all([image(spkCard), image(uvmCard)]),
    Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 2500))]),
  ]);
  return images;
}

/* -------------------------------------------------------------------------- */

const span = (t: number, [a, b]: readonly [number, number]) => clamp((t - a) / (b - a));
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = THREE.MathUtils.lerp;

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
      const images = await loadAssets();
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
      // Phones and small machines get smaller sheets and no depth of field.
      const cores = navigator.hardwareConcurrency || 8;
      const lite = small.matches || cores <= 4;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, small.matches ? 1.5 : 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 200);
      const posCurve = new THREE.CatmullRomCurve3(STATIONS.pos, false, "centripetal");
      const targetCurve = new THREE.CatmullRomCurve3(STATIONS.target, false, "centripetal");

      const pointerUniforms = {
        uPointerPx: { value: new THREE.Vector2(-9999, -9999) },
        uPointerOn: { value: 0 },
        uPointerR: { value: 160 },
      };
      const key = { value: new THREE.Vector3(-0.35, 0.8, 0.5).normalize() };

      /* The sheets ----------------------------------------------------------- */
      const scale = lite ? 1 : 1.42;
      const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const textures: THREE.CanvasTexture[] = [];
      const texture = (canvas: HTMLCanvasElement, premultiply = true) => {
        const map = new THREE.CanvasTexture(canvas);
        map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = anisotropy;
        // Premultiplied texels keep the blurred mips free of dark fringes.
        map.premultiplyAlpha = premultiply;
        textures.push(map);
        return map;
      };
      const pageBox = new THREE.BoxGeometry(PAGE.w, PAGE.h, THICK);
      const codeSize = { w: (PAGE.w * CODE.w) / PX.w, h: (PAGE.h * CODE.h) / PX.h };
      const codeBox = new THREE.BoxGeometry(codeSize.w, codeSize.h, THICK);

      const page = new THREE.Group();
      scene.add(page);
      const sheets = [
        [pageBox, sheetCanvas(PX.w, PX.h, scale, drawWire)],
        [pageBox, sheetCanvas(PX.w, PX.h, scale, drawSurface)],
        [pageBox, sheetCanvas(PX.w, PX.h, scale, (ctx) => drawParts(ctx, images))],
        [codeBox, sheetCanvas(CODE.w, CODE.h, scale, drawCode)],
      ].map(([geometry, canvas], i) => {
        const box = geometry as THREE.BoxGeometry;
        const uniforms = {
          uMap: { value: texture(canvas as HTMLCanvasElement) },
          uSize: { value: new THREE.Vector2(box.parameters.width, box.parameters.height) },
          uShow: { value: 1 },
          uFill: { value: 0 },
          uGhost: { value: 0 },
          uBlur: { value: 0 },
          uBright: { value: 1 },
          uBody: { value: 0.14 },
          uLift: { value: 1 },
          uRim: { value: new THREE.Color(RIMS[i]) },
          uHover: { value: new THREE.Vector3(CTA.x / PX.w, 1 - CTA.y / PX.h, 0) },
          uKey: key,
          ...pointerUniforms,
        };
        const material = new THREE.ShaderMaterial({
          vertexShader: SHEET_VERTEX,
          fragmentShader: SHEET_FRAGMENT,
          uniforms,
          transparent: true,
          premultipliedAlpha: true,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(box, material);
        // The camera always sees the stack from its top, so back to front is fixed.
        mesh.renderOrder = i;
        page.add(mesh);
        return { mesh, uniforms, rim: new THREE.Color(RIMS[i]) };
      });
      const [wire, surface, parts, code] = sheets as [
        (typeof sheets)[number],
        (typeof sheets)[number],
        (typeof sheets)[number],
        (typeof sheets)[number],
      ];
      wire.uniforms.uGhost.value = 0.12;

      const cursorSize = 0.34;
      const cursorGeometry = new THREE.PlaneGeometry(cursorSize, cursorSize);
      const cursorMaterial = new THREE.MeshBasicMaterial({
        // Straight alpha: the material premultiplies the cursor itself.
        map: texture(sheetCanvas(64, 64, lite ? 1 : 2, drawCursor), false),
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      });
      const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
      cursor.renderOrder = 2.5;
      parts.mesh.add(cursor);

      const backdropGeometry = new THREE.BufferGeometry();
      backdropGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3),
      );
      const backdropUniforms = {
        uRes: { value: new THREE.Vector2(1, 1) },
        uCentre: { value: new THREE.Vector2() },
        uDawn: { value: 0 },
        uHalo: { value: 0 },
        uPool: { value: 1 },
      };
      const backdropMaterial = new THREE.ShaderMaterial({
        vertexShader: BACKDROP_VERTEX,
        fragmentShader: BACKDROP_FRAGMENT,
        uniforms: backdropUniforms,
        depthTest: false,
        depthWrite: false,
      });
      const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
      backdrop.frustumCulled = false;
      backdrop.renderOrder = -1;
      scene.add(backdrop);

      /* Placing the sheets for a given t ------------------------------------- */
      const at = new THREE.Vector3();
      const local = (px: number, py: number) =>
        at.set((px / PX.w - 0.5) * PAGE.w, (0.5 - py / PX.h) * PAGE.h, 0);
      const dawnRim = new THREE.Color(0xf0b88a);
      const compose = (t: number, time: number, glow: number, dawn: number, dim: number) => {
        const i0 = Math.min(3, Math.floor(clamp(t, 0, 4)));
        const f = clamp(t - i0);
        // The last step closes late and fast: the sheets snap together at launch.
        const gap = i0 < 3 ? lerp(GAPS[i0]!, GAPS[i0 + 1]!, f) : GAPS[3] * (1 - Math.pow(f, 2.2));
        const spread = gap / GAPS[0];
        const a = TURN[i0]!;
        const b = TURN[i0 + 1]!;
        page.rotation.set(lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f));
        page.scale.setScalar(lerp(SIZE[i0]!, SIZE[i0 + 1]!, f));

        const bob = (i: number) => Math.sin(time * 0.55 + i * 2.1) * 0.08 * spread;
        for (let i = 0; i < 3; i++)
          sheets[i]!.mesh.position.set(
            (i - 1) * 0.42 * spread,
            (i - 1) * -0.18 * spread,
            (i - 1) * gap + i * 0.012 + bob(i),
          );
        const codeIn = ease(span(t, [2.3, 3.0]));
        const codeOut = ease(span(t, [3.5, 3.95]));
        code.mesh.position.set(
          lerp(PAGE.w * 0.95, PAGE.w * 0.24, codeIn),
          lerp(-PAGE.h * 0.6, -PAGE.h * 0.06, codeIn),
          gap * 1.9 + 0.06 + bob(3),
        );
        code.uniforms.uShow.value = codeIn * (1 - codeOut);
        code.mesh.visible = code.uniforms.uShow.value > 0.001;

        wire.uniforms.uFill.value = ease(span(t, [0.2, 1.0]));
        surface.uniforms.uFill.value = ease(span(t, [1.2, 1.95]));
        parts.uniforms.uFill.value = ease(span(t, [1.45, 2.25]));
        code.uniforms.uFill.value = ease(span(t, [2.5, 3.15]));

        const live = ease(span(t, [3.55, 4]));
        for (const s of sheets) {
          s.uniforms.uLift.value = 1 + 0.16 * live + 0.3 * glow;
          s.uniforms.uBody.value = (0.14 - 0.06 * ease(span(t, [0.3, 1]))) * (1 - 0.5 * live);
          s.uniforms.uRim.value
            .lerpColors(s.rim, dawnRim, dawn * 0.7)
            .multiplyScalar(1 + 0.6 * glow);
        }
        // The cursor comes in, tries the button, and leaves once the page is live.
        const c = ease(span(t, [2.6, 3.1]));
        local(lerp(1060, CTA.x + 18, c), lerp(760, CTA.y + 8, c));
        cursor.position.set(
          at.x + cursorSize * (0.5 - 8 / 64),
          at.y - cursorSize * (0.5 - 8 / 64),
          THICK / 2 + 0.03,
        );
        cursorMaterial.opacity =
          ease(span(t, [2.5, 2.8])) * (1 - ease(span(t, [3.45, 3.75]))) * dim;
        cursor.visible = cursorMaterial.opacity > 0.001;
        parts.uniforms.uHover.value.z =
          ease(span(t, [2.95, 3.2])) * (1 - ease(span(t, [3.55, 3.9]))) + glow * 0.8;

        backdropUniforms.uDawn.value = dawn;
        backdropUniforms.uHalo.value = (0.35 * live + 0.5 * glow) * dim;
        backdropUniforms.uPool.value = dim;
        return codeIn * (1 - codeOut);
      };

      /* Typing in the contact form lights the finished page. */
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
        renderer.getDrawingBufferSize(backdropUniforms.uRes.value);
        camera.aspect = width / height;
        measure();
      };
      resize();
      // A resize clears the canvas, so a sleeping loop draws one frame again.
      const resizeObserver = new ResizeObserver(() => {
        resize();
        wake();
      });
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
      let intro = reduced ? 1 : 0;
      let glow = 0;
      let last = performance.now();
      let frame = 0;
      const look = new THREE.Vector3();
      const centre = new THREE.Vector3();
      const sheetAt = new THREE.Vector3();
      const distance = (s: (typeof sheets)[number]) =>
        camera.position.distanceTo(sheetAt.setFromMatrixPosition(s.mesh.matrixWorld));

      const render = (now: number) => {
        frame = 0;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        // Idle motion (the slow float) only plays on the home page journey.
        const moving = !reduced && !pausedRef.current && modeRef.current.kind === "scroll";

        const goal = target();
        t = reduced
          ? goal
          : t + (goal - t) * (1 - Math.exp(-dt / (smoothScrolling() ? 0.12 : 0.3)));
        if (Math.abs(goal - t) < 1e-4) t = goal;
        if (moving) time += dt;
        if (!reduced) intro = Math.min(1, intro + dt / 2.6);

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
        pointerUniforms.uPointerPx.value.set(pointer.lx * ratio, (height - pointer.ly) * ratio);
        pointerUniforms.uPointerR.value = 150 * ratio;
        const on = pointerUniforms.uPointerOn;
        on.value += (pointer.on - on.value) * (reduced ? 1 : 1 - Math.exp(-dt / 0.25));
        if (Math.abs(pointer.on - on.value) < 1e-3) on.value = pointer.on;
        if (moving) {
          camera.position.x += pointer.sx * 1.6 + Math.sin(time * 0.12) * 0.35;
          camera.position.y += -pointer.sy * 0.9;
        }
        // The camera eases in from further back as the page opens.
        camera.position.z += (1 - ease(intro)) * 7 * (1 - u);
        // Narrow screens step back so the page still fits across.
        const aspect = width / Math.max(1, height);
        const heroLeft = 1 - clamp(t);
        let back = aspect < 1.25 ? Math.pow(1.25 / aspect, 0.8) : 1;
        if (small.matches) back *= 1 + 0.05 * heroLeft;
        if (back !== 1) camera.position.sub(look).multiplyScalar(back).add(look);
        camera.lookAt(look);

        const i0 = Math.floor(clamp(t, 0, 3.999));
        let shift = lerp(STATIONS.shift[i0]!, STATIONS.shift[i0 + 1]!, t - i0);
        let lift = 0;
        const m = modeRef.current;
        if (m.kind === "rest") shift = m.shift;
        if (small.matches) {
          shift = 0;
          lift = 0.25;
        }
        camera.setViewOffset(width, height, -shift * width, lift * height, width, height);
        camera.updateProjectionMatrix();

        const glowGoal = glowOn ? 1 : 0;
        glow += (glowGoal - glow) * (reduced ? 1 : 1 - Math.exp(-dt / 0.22));
        if (Math.abs(glowGoal - glow) < 1e-3) glow = glowGoal;

        // Behind body text the page is drawn quieter: centred rest views and the phone's
        // later sections, where the copy runs across the whole screen.
        const dim =
          m.kind === "rest"
            ? m.shift === 0
              ? 0.34
              : 0.85
            : small.matches
              ? 1 - 0.2 * clamp(t)
              : 1;
        const dawn = THREE.MathUtils.smoothstep(t, 3, 4);
        const codeShown = compose(t, time, glow, dawn, dim);
        // A phone shows the page full size above the copy; the /work view sits beside a
        // narrow column, so it is drawn smaller there.
        if (small.matches) page.scale.setScalar(1);
        else if (m.kind === "rest" && m.shift !== 0) page.scale.multiplyScalar(0.72);

        // Focus follows the work: the wireframe, then the components, then the code.
        camera.updateMatrixWorld();
        page.updateMatrixWorld(true);
        const focus = lerp(
          lerp(distance(wire), distance(parts), ease(span(t, [1.2, 1.9]))),
          distance(code),
          codeShown,
        );
        for (const s of sheets) {
          const off = Math.abs(distance(s) - focus);
          s.uniforms.uBlur.value = lite || reduced ? 0 : Math.min(1.8, off * 1.2);
          s.uniforms.uBright.value = dim * (1 - Math.min(0.4, off * 0.12));
        }
        centre.setFromMatrixPosition(page.matrixWorld).project(camera);
        const buffer = backdropUniforms.uRes.value;
        backdropUniforms.uCentre.value.set(
          (centre.x * 0.5 + 0.5) * buffer.x,
          (centre.y * 0.5 + 0.5) * buffer.y,
        );

        renderer.render(scene, camera);
        phaseRef.current?.(t);

        // Sleep once nothing moves; scroll, resize, pointer and play wake it again.
        const settled =
          !moving &&
          t === goal &&
          intro >= 1 &&
          glow === glowGoal &&
          Math.abs(pointer.x - pointer.sx) + Math.abs(pointer.y - pointer.sy) < 1e-3 &&
          Math.abs(pointer.px - pointer.lx) + Math.abs(pointer.py - pointer.ly) < 0.5 &&
          on.value === pointer.on;
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
        window.removeEventListener("farda:glow", onGlow);
        for (const geometry of [pageBox, codeBox, cursorGeometry, backdropGeometry])
          geometry.dispose();
        for (const s of sheets) s.mesh.material.dispose();
        cursorMaterial.dispose();
        backdropMaterial.dispose();
        for (const map of textures) {
          map.dispose();
          // Release the canvas backing store too.
          (map.image as HTMLCanvasElement).width = 0;
        }
        renderer.dispose();
        renderer.forceContextLoss();
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
