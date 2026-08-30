import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

/**
 * Regenerate PWA / favicon PNGs from the brand mark.
 *
 * Source (first that exists):
 *   public/brand/source-logo.png   ← drop the official logo here
 *   public/brand/icon.svg          ← current placeholder
 *
 * Run: `npm run icons`
 */
const OUT = "public/icons";
const SOURCES = ["public/brand/source-logo.png", "public/brand/icon.svg"];

async function loadSource(): Promise<Buffer> {
  for (const s of SOURCES) {
    if (existsSync(s)) {
      console.log(`source: ${s}`);
      return readFile(s);
    }
  }
  throw new Error(`No source found. Expected one of: ${SOURCES.join(", ")}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const src = await loadSource();

  const square = (size: number, bg?: string) =>
    sharp(src, { density: 384 })
      .resize(size, size, { fit: "contain", background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } })
      .flatten(bg ? { background: bg } : false)
      .png();

  // Standard "any" icons — transparent.
  await square(192).toFile(join(OUT, "icon-192.png"));
  await square(512).toFile(join(OUT, "icon-512.png"));

  // Maskable — pad to a safe area (icon at ~72% within a filled square).
  const inner = Math.round(512 * 0.72);
  const pad = Math.round((512 - inner) / 2);
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: "#111827" },
  })
    .composite([
      {
        input: await sharp(src, { density: 384 })
          .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer(),
        top: pad,
        left: pad,
      },
    ])
    .png()
    .toFile(join(OUT, "icon-maskable-512.png"));

  // Apple touch icon — opaque white background, 180.
  await square(180, "#ffffff").toFile(join(OUT, "apple-touch-icon.png"));

  // Small favicon PNG.
  await square(32).toFile(join(OUT, "favicon-32.png"));

  console.log(`✓ wrote icons to ${OUT}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
