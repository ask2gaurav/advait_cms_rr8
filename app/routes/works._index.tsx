import { Link } from "react-router";
import type { Route } from "./+types/works._index";
import { listCaseStudies } from "~/lib/content";
import { buildMeta } from "~/lib/seo";
import { siteContent } from "~/lib/site-content";
import { Container, PageHero } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { Badge } from "~/components/ui/Badge";
import { CaseStudyThumb } from "~/components/CaseStudyThumb";
import { FinalCta } from "~/components/home/FinalCta";

export function meta() {
  return buildMeta({
    title: "Case Studies",
    description: "Where two decades of reliable engineering meets production AI.",
    path: "/works",
  });
}

export function loader() {
  return { items: listCaseStudies() };
}

export default function WorksIndex({ loaderData }: Route.ComponentProps) {
  const { items } = loaderData;
  return (
    <>
      <PageHero
        eyebrow="Case Studies"
        title="Selected work"
        lead="Where two decades of reliable engineering meets production AI."
      />
      <Section>
        <Container>
          {items.length === 0 ? (
            <p className="text-gray-500">No case studies published yet.</p>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2">
              {items.map((c) => (
                <Link
                  key={c.slug}
                  to={`/works/${c.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 transition-colors hover:border-brand-300 dark:border-gray-800 dark:hover:border-brand-500/40"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <CaseStudyThumb item={c} />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white">
                      {c.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {[c.client, c.year].filter(Boolean).join(" · ")}
                    </p>
                    {c.excerpt && (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600 dark:text-gray-400">
                        {c.excerpt}
                      </p>
                    )}
                    {c.readouts.length > 0 && (
                      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                        {c.readouts.slice(0, 3).map((r) => (
                          <div key={`${r.label}-${r.value}`}>
                            <dt className="inline">{r.label}: </dt>
                            <dd className="inline font-medium text-gray-900 dark:text-white">
                              {r.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {c.services.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {c.services.slice(0, 3).map((s) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Section>
      <FinalCta content={siteContent.home.finalCta} />
    </>
  );
}
