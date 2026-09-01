import type { CaseStudyArchitecturePublic } from "~/lib/types";
import { Prose } from "~/components/site";

function Node({
  children,
  live,
}: {
  children: string;
  live?: boolean;
}) {
  return (
    <div
      className={
        live
          ? "rounded-lg border border-brand-300 bg-brand-50 px-3 py-2 text-center text-sm font-medium text-brand-900 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-200"
          : "rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
      }
    >
      {children}
    </div>
  );
}

/**
 * "Before / After" architecture comparison, rebuilt as responsive HTML so it
 * needs no uploaded image. Left panel: a blocked connection. Right panel: an
 * owned, bidirectional one.
 */
export function BeforeAfterDiagram({
  architecture,
}: {
  architecture: CaseStudyArchitecturePublic;
}) {
  const { before, after, captionHtml } = architecture;
  return (
    <figure className="mt-12">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* BEFORE */}
        {before && (
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            {before.heading && (
              <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                {before.heading}
              </p>
            )}
            <div className="flex flex-col items-stretch gap-2">
              {before.from && <Node>{before.from}</Node>}
              <div className="flex flex-col items-center py-1 text-center">
                <span className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                <span
                  aria-hidden
                  className="my-1 flex h-6 w-6 items-center justify-center rounded-full border border-amber-500 text-xs font-bold text-amber-600 dark:text-amber-500"
                >
                  ✕
                </span>
                {before.via && (
                  <span className="font-mono text-[11px] text-gray-500">
                    {before.via}
                  </span>
                )}
                {before.blocked && (
                  <span className="mt-0.5 font-mono text-[11px] text-amber-600 dark:text-amber-500">
                    {before.blocked}
                  </span>
                )}
                <span className="mt-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />
              </div>
              {before.to && <Node>{before.to}</Node>}
            </div>
          </div>
        )}

        {/* AFTER */}
        {after && (
          <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-6 dark:border-brand-500/30 dark:bg-brand-500/5">
            {after.heading && (
              <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                {after.heading}
              </p>
            )}
            <div className="flex flex-col items-stretch gap-2">
              {after.from && <Node live>{after.from}</Node>}
              <div className="flex flex-col items-center gap-1 py-2 text-center">
                <svg
                  aria-hidden
                  viewBox="0 0 24 28"
                  className="h-6 w-6 text-brand-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 8l4-5 4 5" />
                  <path d="M12 3v22" />
                  <path d="M8 20l4 5 4-5" />
                </svg>
                {after.flows.map((f) => (
                  <span
                    key={f}
                    className="font-mono text-[11px] text-brand-700 dark:text-brand-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
              {after.to && <Node live>{after.to}</Node>}
            </div>
          </div>
        )}
      </div>

      {captionHtml && (
        <figcaption className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <Prose html={captionHtml} />
        </figcaption>
      )}
    </figure>
  );
}
