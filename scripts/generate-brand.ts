import { writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Generate the Advait Solutions brand assets from a single geometry source:
 *   public/brand/logo.svg          horizontal lockup (mark + "ADVAiT Solutions")
 *   public/brand/logo-stacked.svg  mark + "ADVAiT" over "Solutions"
 *   public/brand/logo-mark.svg     the mark on its own (theme-aware ink dot)
 *   public/brand/logo-mono.svg     single-colour mark (currentColor)
 *   public/brand/icon.svg          mark on a rounded charcoal tile (feeds `npm run icons`)
 *   app/components/brand-lockup.tsx inline React lockups for the header / footer
 *
 * The mark = orange chevron "A" + a charcoal dot at crossbar height (reads as "A") +
 * an orange tittle dot above the apex (reads as "i") → "Ai". The wordmark repeats the
 * device: "ADV" + "T" are Inter 800; the 4th letter is Inter's "A" with the crossbar
 * removed and the 5th is a lowercase, cap-aligned "i", both drawn as paths.
 *
 * Run: `npm run brand` (then `npm run icons` to re-raster the PNG/ICO set).
 */

const ROOT = join(import.meta.dirname, "..");
const BRAND = join(ROOT, "public", "brand");
const COMPONENT = join(ROOT, "app", "components", "brand-lockup.tsx");

const ORANGE = "#F97316";
const INK = "#1F2937";
const INK_DARK = "#F9FAFB";

// Inter-800 advances @ font-size 100, letter-spacing 4 (measured in Chrome, document units):
const LS = 4;
const ADV = 229.6; // "ADV" run incl. trailing letter-spacing
const T = 71.7; // "T" glyph advance
const SOL = 448.5; // "Solutions" @ Inter 500
const CAP = 72.7; // Inter cap height
const SG_A = 0.8; // custom "A" scale (slight overshoot so the pointed apex aligns optically)
const SG_I = 0.75; // custom "i" scale
const A_SLOT = 64;
const I_SLOT = 30;

const FONT = "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";
const JSX_FONT = "Inter, system-ui, sans-serif";

const CHEVRON = (stroke: string) =>
  `<path d="M28 105 L60 21 L92 105" fill="none" stroke="${stroke}" stroke-width="13" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="2"/>`;
const G_A = `<path d="M2 100 L30 2 L46 2 L74 100 L50 100 L38 34 L26 100 Z"/>`; // box 76x100, baseline y=100
const G_I = `<rect x="2" y="29" width="22" height="71" rx="1"/><rect x="1" y="0" width="24" height="21" rx="4.5"/>`; // box 26x100

const STYLE = `<style>.ink{fill:${INK}}@media(prefers-color-scheme:dark){.ink{fill:${INK_DARK}}}</style>`;

function markSvg(inkAttr: string) {
  return `${CHEVRON(ORANGE)}<circle cx="60" cy="64" r="5" ${inkAttr}/><circle cx="60" cy="8" r="6" fill="${ORANGE}"/>`;
}

function horizontalLayout() {
  const k = 0.92;
  const hs = 6.5 * k;
  const ty = 100 - 105 * k;
  const tx = 4 - (28 * k - hs);
  const markRight = 92 * k + tx + hs;
  const xw = markRight + 34;
  const advEnd = xw + ADV;
  const aX = advEnd + (A_SLOT - 76 * SG_A) / 2;
  const aEnd = advEnd + A_SLOT;
  const iX = aEnd + (I_SLOT - 26 * SG_I) / 2;
  const iEnd = aEnd + I_SLOT;
  const tX = iEnd;
  const tEnd = tX + T;
  const solX = tEnd + 18;
  const solEnd = solX + SOL;
  return { k, tx, ty, xw, aX, iX, tX, solX, w: Math.ceil(solEnd + 6) };
}

function stackedLayout() {
  const b1 = 92; // "ADVAiT" baseline
  const c1 = b1 - CAP; // cap top
  const solSize = 41;
  const b2 = b1 + 46; // "Solutions" baseline
  const k = Number(((b2 - c1) / (105 - 21)).toFixed(4)); // mark: apex → cap top, base → "Solutions" baseline
  const hs = 6.5 * k;
  const ty = b2 - 105 * k;
  const tx = 4 - (28 * k - hs);
  const markRight = 92 * k + tx + hs;
  const xw = markRight + 24;
  const advEnd = xw + ADV;
  const aX = advEnd + (A_SLOT - 76 * SG_A) / 2;
  const aEnd = advEnd + A_SLOT;
  const iX = aEnd + (I_SLOT - 26 * SG_I) / 2;
  const iEnd = aEnd + I_SLOT;
  const tX = iEnd;
  const tEnd = tX + T;
  const solEnd = xw + SOL * (solSize / 100) + 16;
  const vbTop = Math.floor(8 * k + ty - hs - 2);
  return {
    k, tx, ty, xw, aX, iX, tX, b1, b2, solSize, vbTop,
    w: Math.ceil(Math.max(tEnd, solEnd) + 6),
    h: Math.ceil(b2 + 4 - vbTop),
  };
}

const f2 = (n: number) => n.toFixed(2);
const f1 = (n: number) => n.toFixed(1);

function logoSvg() {
  const L = horizontalLayout();
  const aY = f1(100 - 100 * SG_A);
  const iY = f1(100 - 100 * SG_I);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -6 ${L.w} 112" role="img" aria-label="Advait Solutions" fill="none">${STYLE}
  <g transform="translate(${f2(L.tx)} ${f2(L.ty)}) scale(${L.k})">${markSvg('class="ink"')}</g>
  <text x="${f1(L.xw)}" y="100" font-family="${FONT}" font-weight="800" font-size="100" letter-spacing="${LS}" fill="${ORANGE}">ADV</text>
  <g transform="translate(${f2(L.aX)} ${aY}) scale(${SG_A})" fill="${ORANGE}">${G_A}</g>
  <g transform="translate(${f2(L.iX)} ${iY}) scale(${SG_I})" fill="${ORANGE}">${G_I}</g>
  <text x="${f1(L.tX)}" y="100" font-family="${FONT}" font-weight="800" font-size="100" letter-spacing="${LS}" fill="${ORANGE}">T</text>
  <text x="${f1(L.solX)}" y="100" font-family="${FONT}" font-weight="500" font-size="100" letter-spacing="0.5" class="ink">Solutions</text>
</svg>
`;
}

function logoStackedSvg() {
  const L = stackedLayout();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${L.vbTop} ${L.w} ${L.h}" role="img" aria-label="Advait Solutions" fill="none">${STYLE}
  <g transform="translate(${f2(L.tx)} ${f2(L.ty)}) scale(${L.k})">${markSvg('class="ink"')}</g>
  <text x="${f1(L.xw)}" y="${L.b1}" font-family="${FONT}" font-weight="800" font-size="100" letter-spacing="${LS}" fill="${ORANGE}">ADV</text>
  <g transform="translate(${f2(L.aX)} ${f1(L.b1 - 100 * SG_A)}) scale(${SG_A})" fill="${ORANGE}">${G_A}</g>
  <g transform="translate(${f2(L.iX)} ${f1(L.b1 - 100 * SG_I)}) scale(${SG_I})" fill="${ORANGE}">${G_I}</g>
  <text x="${f1(L.tX)}" y="${L.b1}" font-family="${FONT}" font-weight="800" font-size="100" letter-spacing="${LS}" fill="${ORANGE}">T</text>
  <text x="${f1(L.xw)}" y="${L.b2}" font-family="${FONT}" font-weight="500" font-size="${L.solSize}" letter-spacing="1.6" class="ink">Solutions</text>
</svg>
`;
}

function markOnlySvg(mono: boolean) {
  const stroke = mono ? "currentColor" : ORANGE;
  const dot = mono ? 'fill="currentColor"' : 'class="ink"';
  const tittle = mono ? "currentColor" : ORANGE;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="12 -6 96 118" role="img" aria-label="Advait Solutions" fill="none">${mono ? "" : STYLE}
  <path d="M28 105 L60 21 L92 105" fill="none" stroke="${stroke}" stroke-width="13" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="2"/>
  <circle cx="60" cy="64" r="5" ${dot}/>
  <circle cx="60" cy="8" r="6" fill="${tittle}"/>
</svg>
`;
}

function iconSvg() {
  const s = (512 * 0.62) / 96; // fit the ~96-wide content box into a 62% safe area
  const cx = 60;
  const cy = 55;
  const tx = 256 - cx * s;
  const ty = 256 - cy * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Advait Solutions">
  <rect width="512" height="512" rx="112" fill="#111827"/>
  <g transform="translate(${f2(tx)} ${f2(ty)}) scale(${s.toFixed(4)})">
    <path d="M28 105 L60 21 L92 105" fill="none" stroke="${ORANGE}" stroke-width="13" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="2"/>
    <circle cx="60" cy="64" r="5" fill="${INK_DARK}"/>
    <circle cx="60" cy="8" r="6" fill="${ORANGE}"/>
  </g>
</svg>
`;
}

function component() {
  const H = horizontalLayout();
  const K = stackedLayout();
  const chevron = (k: number, tx: number, ty: number) =>
    `      <g transform="translate(${f2(tx)} ${f2(ty)}) scale(${k})">
        <path d="M28 105 L60 21 L92 105" fill="none" stroke="${ORANGE}" strokeWidth="13" strokeLinejoin="miter" strokeMiterlimit="2" />
        <circle cx="60" cy="64" r="5" fill="currentColor" />
        <circle cx="60" cy="8" r="6" fill="${ORANGE}" />
      </g>`;
  const gA = (x: number, base: number) =>
    `      <g transform="translate(${f2(x)} ${f1(base - 100 * SG_A)}) scale(${SG_A})" fill="${ORANGE}">
        <path d="M2 100 L30 2 L46 2 L74 100 L50 100 L38 34 L26 100 Z" />
      </g>`;
  const gI = (x: number, base: number) =>
    `      <g transform="translate(${f2(x)} ${f1(base - 100 * SG_I)}) scale(${SG_I})" fill="${ORANGE}">
        <rect x="2" y="29" width="22" height="71" rx="1" />
        <rect x="1" y="0" width="24" height="21" rx="4.5" />
      </g>`;
  return `// AUTO-GENERATED by \`npm run brand\` (scripts/generate-brand.ts) — do not edit by hand.
// Inline (not <img>) so "Solutions" and the crossbar dot follow the class-based dark
// theme via currentColor, and so "ADV" / "T" render in the site's Inter webfont.

export function BrandLockup({ className }: { className?: string }) {
  return (
    <svg viewBox="0 -6 ${H.w} 112" className={className} role="img" aria-label="Advait Solutions" fill="none">
${chevron(H.k, H.tx, H.ty)}
      <text x="${f1(H.xw)}" y="100" fontFamily="${JSX_FONT}" fontWeight="800" fontSize="100" letterSpacing="${LS}" fill="${ORANGE}">ADV</text>
${gA(H.aX, 100)}
${gI(H.iX, 100)}
      <text x="${f1(H.tX)}" y="100" fontFamily="${JSX_FONT}" fontWeight="800" fontSize="100" letterSpacing="${LS}" fill="${ORANGE}">T</text>
      <text x="${f1(H.solX)}" y="100" fontFamily="${JSX_FONT}" fontWeight="500" fontSize="100" letterSpacing="0.5" fill="currentColor">Solutions</text>
    </svg>
  );
}

export function BrandLockupStacked({ className }: { className?: string }) {
  return (
    <svg viewBox="0 ${K.vbTop} ${K.w} ${K.h}" className={className} role="img" aria-label="Advait Solutions" fill="none">
${chevron(K.k, K.tx, K.ty)}
      <text x="${f1(K.xw)}" y="${K.b1}" fontFamily="${JSX_FONT}" fontWeight="800" fontSize="100" letterSpacing="${LS}" fill="${ORANGE}">ADV</text>
${gA(K.aX, K.b1)}
${gI(K.iX, K.b1)}
      <text x="${f1(K.tX)}" y="${K.b1}" fontFamily="${JSX_FONT}" fontWeight="800" fontSize="100" letterSpacing="${LS}" fill="${ORANGE}">T</text>
      <text x="${f1(K.xw)}" y="${K.b2}" fontFamily="${JSX_FONT}" fontWeight="500" fontSize="${K.solSize}" letterSpacing="1.6" fill="currentColor">Solutions</text>
    </svg>
  );
}
`;
}

writeFileSync(join(BRAND, "logo.svg"), logoSvg());
writeFileSync(join(BRAND, "logo-stacked.svg"), logoStackedSvg());
writeFileSync(join(BRAND, "logo-mark.svg"), markOnlySvg(false));
writeFileSync(join(BRAND, "logo-mono.svg"), markOnlySvg(true));
writeFileSync(join(BRAND, "icon.svg"), iconSvg());
writeFileSync(COMPONENT, component());

console.log("✓ wrote public/brand/{logo,logo-stacked,logo-mark,logo-mono,icon}.svg");
console.log("✓ wrote app/components/brand-lockup.tsx");
console.log("  next: npm run icons");
