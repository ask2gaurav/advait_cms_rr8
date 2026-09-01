import type { CaseStudyReadout, MediaPublic } from "~/lib/types";
import { Container } from "~/components/site";
import { GridMotif } from "~/components/visuals/GridMotif";

/**
 * Dark long-form case-study hero: eyebrow, headline, lede and a row of stat
 * "readout" chips, with an optional full-width cover image below.
 */
export function CaseStudyHero({
  title,
  lead,
  readouts = [],
  cover,
}: {
  title: string;
  lead?: string;
  readouts?: CaseStudyReadout[];
  cover?: MediaPublic;
}) {
  return (
    <header className="relative overflow-hidden bg-charcoal text-gray-100 dark:bg-black">
      <GridMotif className="text-white/[0.06]" />
      <Container className="relative py-16 sm:py-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-400">
          Case study
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {lead && (
          <p className="mt-4 max-w-2xl text-lg text-gray-300">{lead}</p>
        )}

        {readouts.length > 0 && (
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6 border-t border-white/10 pt-8">
            {readouts.map((r) => (
              <div key={`${r.label}-${r.value}`}>
                <dt className="text-xs uppercase tracking-widest text-gray-400">
                  {r.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Container>

      {cover && (
        <Container className="relative pb-16 sm:pb-20">
          <img
            src={cover.path}
            alt={cover.alt ?? title}
            width={cover.width ?? 1200}
            height={cover.height ?? 675}
            loading="lazy"
            decoding="async"
            className="w-full rounded-xl border border-white/10 object-cover"
          />
        </Container>
      )}
    </header>
  );
}
