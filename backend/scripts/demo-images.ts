/**
 * Generates a studio-style demo image for every seeded product:
 * the item's silhouette in its main colour on a soft tinted background.
 *
 *   npm run seed:images            # writes ../public/images/products/<id>.svg
 *
 * Swap these for real photography with `npm run seed:photos` (needs UNSPLASH_ACCESS_KEY).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { SEED_PRODUCTS } from "../src/data/products";
import type { Product } from "../src/types";

const OUT_DIR = new URL("../../public/images/products/", import.meta.url).pathname;

const PALETTE: Record<string, { fill: string; bg: string }> = {
  black: { fill: "#232325", bg: "#ECEAE6" },
  white: { fill: "#F7F6F2", bg: "#DFE5EA" },
  blue: { fill: "#3E5F95", bg: "#E3EAF3" },
  brown: { fill: "#7B4B2A", bg: "#F1E6DB" },
  pink: { fill: "#E59BB2", bg: "#F8E7ED" },
  beige: { fill: "#D9C2A2", bg: "#F2ECE3" },
  red: { fill: "#C23A30", bg: "#F6E2DE" },
  green: { fill: "#4E6E50", bg: "#E4EDE2" },
};
const NEUTRAL = { fill: "#C9A26B", bg: "#F2ECE5" };

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift: number) =>
    Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * (1 + amount))));
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("")}`;
}

type Shape = (c: { fill: string; dark: string; light: string }) => string;

// All shapes are drawn on a 600×750 canvas, centred on x = 300.
const SHAPES: Record<string, Shape> = {
  tee: ({ fill, dark }) => `
    <path d="M222 228 L268 206 Q300 236 332 206 L378 228 L442 290 L404 334 L380 312 L380 548 L220 548 L220 312 L196 334 L158 290 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <path d="M268 206 Q300 236 332 206" fill="none" stroke="${dark}" stroke-width="3"/>`,
  longSleeve: ({ fill, dark }) => `
    <path d="M222 222 L268 200 Q300 228 332 200 L378 222 L432 300 L452 540 L414 546 L388 340 L384 556 L216 556 L212 340 L186 546 L148 540 L168 300 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <path d="M268 200 L300 252 L332 200" fill="none" stroke="${dark}" stroke-width="3"/>
    <line x1="300" y1="252" x2="300" y2="556" stroke="${dark}" stroke-width="2" stroke-dasharray="2 22"/>`,
  hoodie: ({ fill, dark }) => `
    <path d="M226 236 Q300 140 374 236 L436 304 L456 544 L418 550 L392 346 L388 560 L212 560 L208 346 L182 550 L144 544 L164 304 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <path d="M250 236 Q300 196 350 236 Q300 270 250 236 Z" fill="${dark}" opacity="0.35"/>
    <path d="M246 448 L354 448 L344 510 L256 510 Z" fill="none" stroke="${dark}" stroke-width="2"/>`,
  sweater: ({ fill, dark }) => `
    <path d="M228 218 Q300 246 372 218 L432 296 L456 548 L414 552 L390 344 L388 560 L212 560 L210 344 L186 552 L144 548 L168 296 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<line x1="${222 + i * 22}" y1="532" x2="${222 + i * 22}" y2="558" stroke="${dark}" stroke-width="2"/>`).join("")}`,
  jacket: ({ fill, dark }) => `
    <path d="M220 214 L272 196 L300 300 L328 196 L380 214 L436 296 L456 546 L416 552 L392 344 L390 566 L210 566 L208 344 L184 552 L144 546 L164 296 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <path d="M272 196 L254 286 L300 300 M328 196 L346 286 L300 300" fill="none" stroke="${dark}" stroke-width="3"/>
    <line x1="300" y1="300" x2="300" y2="566" stroke="${dark}" stroke-width="3"/>`,
  trousers: ({ fill, dark }) => `
    <path d="M232 200 L368 200 L392 580 L318 580 L300 330 L282 580 L208 580 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <line x1="232" y1="228" x2="368" y2="228" stroke="${dark}" stroke-width="3"/>`,
  shorts: ({ fill, dark }) => `
    <path d="M226 250 L374 250 L398 470 L318 480 L300 340 L282 480 L202 470 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <line x1="226" y1="276" x2="374" y2="276" stroke="${dark}" stroke-width="3"/>`,
  skirt: ({ fill, dark }) => `
    <path d="M248 250 L352 250 L410 520 L190 520 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    ${[-2, -1, 0, 1, 2].map((i) => `<line x1="${300 + i * 22}" y1="270" x2="${300 + i * 48}" y2="518" stroke="${dark}" stroke-width="2"/>`).join("")}`,
  dress: ({ fill, dark }) => `
    <path d="M262 190 L276 190 L286 240 L314 240 L324 190 L338 190 L348 270 Q334 310 344 334 L430 580 L170 580 L256 334 Q266 310 252 270 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <path d="M256 334 Q300 350 344 334" fill="none" stroke="${dark}" stroke-width="3"/>`,
  gown: ({ fill, dark }) => `
    <path d="M264 170 L278 170 L288 222 L312 222 L322 170 L336 170 L346 256 Q332 300 342 330 L446 620 L154 620 L258 330 Q268 300 254 256 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <path d="M258 330 Q300 348 342 330" fill="none" stroke="${dark}" stroke-width="3"/>`,
  boot: ({ fill, dark }) => `
    <path d="M232 212 L328 212 L332 420 Q340 448 400 460 Q448 470 448 508 L448 532 L232 532 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <rect x="232" y="532" width="216" height="16" rx="3" fill="${dark}"/>
    <rect x="232" y="532" width="48" height="40" rx="3" fill="${dark}"/>`,
  sneaker: ({ fill, dark, light }) => `
    <path d="M150 470 Q156 404 218 392 L292 356 Q334 344 354 380 Q384 418 440 428 Q470 436 466 478 L466 494 L150 494 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <rect x="146" y="490" width="324" height="30" rx="12" fill="${light}" stroke="${dark}" stroke-width="2"/>
    ${[0, 1, 2, 3].map((i) => `<line x1="${262 + i * 20}" y1="${380 - i * 6}" x2="${286 + i * 20}" y2="${404 - i * 6}" stroke="${dark}" stroke-width="3"/>`).join("")}
    <path d="M230 452 Q300 420 380 446" fill="none" stroke="${dark}" stroke-width="3"/>`,
  lipstick: ({ fill, dark }) => `
    <rect x="262" y="400" width="76" height="190" rx="6" fill="#2B2B2D"/>
    <rect x="270" y="330" width="60" height="78" rx="4" fill="#C7A76A"/>
    <path d="M276 330 L276 250 L324 210 L324 330 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>`,
  gloss: ({ fill, dark }) =>
    [240, 300, 360]
      .map(
        (x, i) => `
    <rect x="${x - 20}" y="${300 + i * 6}" width="40" height="210" rx="18" fill="${fill}" opacity="${0.75 + i * 0.1}" stroke="${dark}" stroke-width="2"/>
    <rect x="${x - 22}" y="${236 + i * 6}" width="44" height="72" rx="8" fill="#2B2B2D"/>`,
      )
      .join(""),
  mascara: ({ dark }) => `
    <rect x="276" y="260" width="48" height="330" rx="20" fill="#232325"/>
    <rect x="280" y="200" width="40" height="70" rx="8" fill="${dark}"/>
    <rect x="276" y="430" width="48" height="10" fill="#C7A76A"/>`,
  palette: ({ fill }) => `
    <rect x="168" y="300" width="264" height="190" rx="18" fill="#2B2B2D"/>
    ${[0, 1, 2, 3, 4, 5]
      .map((i) => {
        const tones = [shade(fill, 0.25), fill, shade(fill, -0.2), shade(fill, 0.1), shade(fill, -0.35), shade(fill, 0.4)];
        return `<circle cx="${214 + (i % 3) * 86}" cy="${350 + Math.floor(i / 3) * 90}" r="32" fill="${tones[i]}"/>`;
      })
      .join("")}`,
  dropper: ({ fill, dark }) => `
    <rect x="236" y="360" width="128" height="230" rx="22" fill="${fill}" opacity="0.92" stroke="${dark}" stroke-width="2"/>
    <rect x="262" y="320" width="76" height="48" rx="6" fill="#2B2B2D"/>
    <ellipse cx="300" cy="300" rx="30" ry="36" fill="#2B2B2D"/>
    <rect x="252" y="440" width="96" height="70" rx="4" fill="#FFFFFF" opacity="0.7"/>`,
  perfume: ({ fill, dark }) => `
    <rect x="206" y="350" width="188" height="230" rx="28" fill="${fill}" opacity="0.88" stroke="${dark}" stroke-width="2"/>
    <rect x="270" y="300" width="60" height="56" rx="6" fill="#C7A76A"/>
    <rect x="252" y="236" width="96" height="70" rx="12" fill="#2B2B2D"/>
    <rect x="246" y="430" width="108" height="64" rx="4" fill="#FFFFFF" opacity="0.65"/>`,
  jar: ({ fill, dark }) => `
    <rect x="196" y="412" width="208" height="150" rx="26" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <rect x="186" y="360" width="228" height="62" rx="14" fill="#2B2B2D"/>
    <rect x="236" y="460" width="128" height="56" rx="4" fill="#FFFFFF" opacity="0.7"/>`,
  tube: ({ fill, dark }) => `
    <path d="M240 236 L360 236 L344 520 L256 520 Z" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <rect x="262" y="520" width="76" height="60" rx="8" fill="#2B2B2D"/>
    <rect x="262" y="320" width="76" height="120" rx="4" fill="#FFFFFF" opacity="0.7"/>`,
  pump: ({ fill, dark }) => `
    <rect x="228" y="330" width="144" height="260" rx="30" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <rect x="276" y="282" width="48" height="54" rx="6" fill="#2B2B2D"/>
    <path d="M286 282 L286 236 L352 236 L352 252 L304 252 L304 282 Z" fill="#2B2B2D"/>
    <rect x="252" y="420" width="96" height="90" rx="4" fill="#FFFFFF" opacity="0.7"/>`,
  foundation: ({ fill, dark }) => `
    <rect x="232" y="330" width="136" height="260" rx="14" fill="${fill}" stroke="${dark}" stroke-width="2"/>
    <rect x="258" y="250" width="84" height="86" rx="8" fill="#2B2B2D"/>
    <rect x="256" y="430" width="88" height="80" rx="4" fill="#FFFFFF" opacity="0.7"/>`,
};

/** Lowest y of each shape (so everything stands on one baseline) and an optional zoom. */
const LAYOUT: Record<keyof typeof SHAPES, { bottom: number; scale?: number }> = {
  tee: { bottom: 548 },
  longSleeve: { bottom: 556 },
  hoodie: { bottom: 560 },
  sweater: { bottom: 560 },
  jacket: { bottom: 566 },
  trousers: { bottom: 580 },
  shorts: { bottom: 480, scale: 1.2 },
  skirt: { bottom: 520, scale: 1.1 },
  dress: { bottom: 580 },
  gown: { bottom: 620 },
  boot: { bottom: 572, scale: 1.05 },
  sneaker: { bottom: 520, scale: 1.35 },
  lipstick: { bottom: 590 },
  gloss: { bottom: 524 },
  mascara: { bottom: 590 },
  palette: { bottom: 490, scale: 1.25 },
  dropper: { bottom: 590 },
  perfume: { bottom: 580 },
  jar: { bottom: 562, scale: 1.15 },
  tube: { bottom: 580 },
  pump: { bottom: 590 },
  foundation: { bottom: 590 },
};
const BASELINE = 610;

function shapeFor(p: Product): keyof typeof SHAPES {
  const has = (...tags: string[]) => tags.some((t) => p.tags.includes(t));
  if (p.category === "sneakers") return "sneaker";
  if (has("boots")) return "boot";
  if (has("lips")) return has("gloss") ? "gloss" : "lipstick";
  if (has("mascara")) return "mascara";
  if (has("palette")) return "palette";
  if (has("foundation")) return "foundation";
  if (has("fragrance")) return "perfume";
  if (has("serum")) return "dropper";
  if (has("cream")) return "jar";
  if (has("sunscreen")) return "tube";
  if (has("cleanser")) return "pump";
  if (has("evening")) return "gown";
  if (has("dress")) return "dress";
  if (has("skirt")) return "skirt";
  if (has("shorts")) return "shorts";
  if (has("trousers", "jeans", "chinos", "joggers")) return "trousers";
  if (has("hoodie")) return "hoodie";
  if (has("sweater", "knitwear")) return "sweater";
  if (has("jacket", "blazer", "outerwear")) return "jacket";
  if (has("shirt", "blouse")) return "longSleeve";
  return "tee";
}

export function demoImage(p: Product) {
  const colour = PALETTE[p.colors[0]] ?? NEUTRAL;
  const fill = colour.fill;
  const dark = shade(fill, fill === PALETTE.white.fill ? -0.22 : -0.3);
  const light = fill === PALETTE.white.fill ? "#FFFFFF" : shade(fill, 0.55);
  const shape = shapeFor(p);
  const { bottom, scale = 1 } = LAYOUT[shape];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750" role="img" aria-label="${p.name}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="${shade(colour.bg, 0.04)}"/>
      <stop offset="1" stop-color="${shade(colour.bg, -0.06)}"/>
    </radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="600" height="750" fill="url(#bg)"/>
  <ellipse cx="300" cy="${BASELINE + 6}" rx="${Math.round(150 * scale)}" ry="16" fill="#000" opacity="0.12" filter="url(#soft)"/>
  <g transform="translate(300 ${BASELINE}) scale(${scale}) translate(-300 -${bottom})">${SHAPES[shape]({ fill, dark, light })}</g>
</svg>
`;
}

// Run as a script: write one file per seeded product.
if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const p of SEED_PRODUCTS) writeFileSync(`${OUT_DIR}${p.id}.svg`, demoImage(p));
  console.log(`Wrote ${SEED_PRODUCTS.length} demo images to ${OUT_DIR}`);
}
