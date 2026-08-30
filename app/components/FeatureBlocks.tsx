import { Icon, type IconName } from "~/components/Icon";

export interface FeatureBlock {
  icon: IconName;
  title: string;
  body: string;
}

/** Vertical list of icon + heading + paragraph blocks (Services / Products). */
export function FeatureBlocks({
  blocks,
  columns = 2,
}: {
  blocks: readonly FeatureBlock[];
  columns?: 1 | 2 | 3;
}) {
  return (
    <div
      className={
        columns === 1
          ? "grid gap-8"
          : columns === 3
            ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-8 sm:grid-cols-2"
      }
    >
      {blocks.map((b) => (
        <article key={b.title} className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <Icon name={b.icon} />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {b.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {b.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
