import type { CaseStudyPublic } from "~/lib/types";
import { GridMotif } from "~/components/visuals/GridMotif";

/** Cover image for a case-study card, with a branded fallback when none is set. */
export function CaseStudyThumb({ item }: { item: CaseStudyPublic }) {
  if (item.coverImage) {
    return (
      <img
        src={item.coverImage.path}
        alt={item.coverImage.alt ?? item.title}
        width={item.coverImage.width ?? 800}
        height={item.coverImage.height ?? 450}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    );
  }
  const initials = item.title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-mist dark:bg-gray-800">
      <GridMotif />
      <span className="relative text-3xl font-semibold text-brand-500/70">
        {initials}
      </span>
    </div>
  );
}
