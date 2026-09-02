import type { CSSProperties } from "react";
import manifest from "../../content/image-manifest.json";
import type { MediaPublic } from "~/lib/types";

type ManifestEntry = { w: number[] };
const MANIFEST = manifest as Record<string, ManifestEntry | undefined>;

/** `/uploads/seed/cover.png` → `/uploads/_derived/seed/cover` */
function derivedBase(path: string): string {
  return path
    .replace(/\.[^./]+$/, "")
    .replace(/^\/uploads\//, "/uploads/_derived/");
}

/**
 * Responsive image for CMS media. When `npm run optimize:media` has produced
 * WebP/AVIF variants for `media.path`, renders a `<picture>` with a
 * width-descriptor `srcset`; otherwise falls back to a plain `<img>` of the
 * original (SVGs, or before the build step has run).
 *
 * `className` / `style` apply to the inner `<img>` so existing layout classes
 * (`object-cover h-full w-full`, rounded, borders…) keep working.
 */
export function Img({
  media,
  sizes,
  className,
  style,
  alt,
  priority = false,
}: {
  media: MediaPublic;
  sizes: string;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  priority?: boolean;
}) {
  const altText = alt ?? media.alt ?? "";
  const img = (
    <img
      src={media.path}
      alt={altText}
      width={media.width}
      height={media.height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // React 19 lowercases this to the `fetchpriority` attribute.
      fetchPriority={priority ? "high" : undefined}
      className={className}
      style={style}
    />
  );

  const entry = MANIFEST[media.path];
  if (!entry || entry.w.length === 0) return img;

  const base = derivedBase(media.path);
  const srcSet = (fmt: "avif" | "webp") =>
    entry.w.map((w) => `${base}.${w}.${fmt} ${w}w`).join(", ");

  return (
    <picture className="contents">
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      {img}
    </picture>
  );
}
