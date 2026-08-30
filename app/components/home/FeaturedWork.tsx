import { Link } from "react-router";
import { Section } from "~/components/layout/Section";
import { Container } from "~/components/site";
import { SectionHeading } from "~/components/layout/SectionHeading";
import { Badge } from "~/components/ui/Badge";
import { CaseStudyThumb } from "~/components/CaseStudyThumb";
import type { CaseStudyPublic } from "~/lib/types";
import type { siteContent } from "~/lib/site-content";

type Content = typeof siteContent.home.featuredWork;

export function FeaturedWork({
  content,
  caseStudies,
}: {
  content: Content;
  caseStudies: CaseStudyPublic[];
}) {
  const hasReal = caseStudies.length > 0;

  return (
    <Section cmsSection="featured-work">
      <Container>
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          lead={content.lead}
          link={hasReal ? { to: "/works", label: "All case studies" } : undefined}
        />

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {hasReal
            ? caseStudies.map((c) => (
                <Link
                  key={c.slug}
                  to={`/works/${c.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 transition-colors hover:border-brand-300 dark:border-gray-800 dark:hover:border-brand-500/40"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <CaseStudyThumb item={c} />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white">
                      {c.title}
                    </h3>
                    {(c.client || c.year) && (
                      <p className="mt-1 text-sm text-gray-500">
                        {[c.client, c.year].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {c.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                        {c.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            : content.fallback.map((f) => (
                <article
                  key={f.title}
                  className="flex flex-col rounded-xl border border-gray-200 p-6 dark:border-gray-800"
                >
                  <Badge variant="brand">Case study</Badge>
                  <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{f.client}</p>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    {f.summary}
                  </p>
                </article>
              ))}
        </div>
      </Container>
    </Section>
  );
}
