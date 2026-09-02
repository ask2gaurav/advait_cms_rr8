import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import sharp from "sharp";

/**
 * Generate responsive WebP + AVIF variants for every raster image under
 * `public/uploads/`, and write `content/image-manifest.json` mapping each
 * original path to the widths that were produced.
 *
 * Variants land at `public/uploads/_derived/<relDir>/<name>.<w>.<fmt>` and are
 * git-ignored (regenerated at publish time). Idempotent — skips a variant whose
 * file is newer than its source.
 *
 * Run: `npm run optimize:media` (part of `npm run publish:static`).
 */

const UPLOADS = join("public", "uploads");
const DERIVED = join(UPLOADS, "_derived");
const MANIFEST = join("content", "image-manifest.json");

const LADDER = [384, 640, 960, 1280, 1600, 1920];
const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (full === DERIVED) continue; // never recurse into our own output
      out.push(...(await walk(full)));
    } else if (RASTER.has(extname(e.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

/** Target widths for a source of real width `w`. */
function targetsFor(w: number): number[] {
  const set = new Set(LADDER.filter((x) => x < w));
  set.add(Math.min(w, 1920));
  return [...set].sort((a, b) => a - b);
}

async function isFresh(out: string, srcMtimeMs: number): Promise<boolean> {
  try {
    return (await stat(out)).mtimeMs >= srcMtimeMs;
  } catch {
    return false;
  }
}

async function main() {
  const files = await walk(UPLOADS);
  const manifest: Record<string, { w: number[] }> = {};
  let written = 0;

  for (const src of files.sort()) {
    const rel = relative(UPLOADS, src); // e.g. seed/cover.png
    const publicPath = `/uploads/${rel.split(/[/\\]/).join("/")}`;
    const srcMtimeMs = (await stat(src)).mtimeMs;

    let meta;
    try {
      meta = await sharp(src).metadata();
    } catch {
      console.warn(`  ! skipped (unreadable): ${rel}`);
      continue;
    }
    const w = meta.width ?? 0;
    if (!w) continue;

    const widths = targetsFor(w);
    manifest[publicPath] = { w: widths };

    const stem = rel.slice(0, rel.length - extname(rel).length);
    const outBase = join(DERIVED, stem); // public/uploads/_derived/seed/cover

    try {
      await Promise.all(
        widths.flatMap((width) =>
          (["webp", "avif"] as const).map(async (fmt) => {
            const out = `${outBase}.${width}.${fmt}`;
            if (await isFresh(out, srcMtimeMs)) return;
            await mkdir(dirname(out), { recursive: true });
            const pipe = sharp(src).resize(width, null, {
              withoutEnlargement: true,
            });
            await (fmt === "webp"
              ? pipe.webp({ quality: 74 })
              : pipe.avif({ quality: 55, effort: 4 })
            ).toFile(out);
            written++;
          }),
        ),
      );
    } catch (err) {
      // A single unreadable source shouldn't fail the whole publish — the
      // component falls back to the original file when it's not in the manifest.
      delete manifest[publicPath];
      console.warn(
        `  ! skipped (encode failed): ${rel} — ${(err as Error).message.split("\n")[0]}`,
      );
    }
  }

  await mkdir(dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `✓ optimized ${Object.keys(manifest).length} image(s), ${written} variant file(s) written → ${DERIVED}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
