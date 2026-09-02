import { Link } from "react-router";
import type { Route } from "./+types/works.$slug";
import { getCaseStudy } from "~/lib/content";
import { articleJsonLd, breadcrumbJsonLd, buildMeta } from "~/lib/seo";
import { siteContent } from "~/lib/site-content";
import { Container, JsonLd, Prose } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { FinalCta } from "~/components/home/FinalCta";
import { CaseStudyHero } from "~/components/case-study/CaseStudyHero";
import { CaseStudySections } from "~/components/case-study/CaseStudySections";
import { Img } from "~/components/Img";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.item) return buildMeta({ title: "Not found", noindex: true });
  const c = loaderData.item;
  return buildMeta({
    title: c.seoTitle ?? c.title,
    description: c.seoDescription ?? c.excerpt,
    image: c.ogImage ?? c.coverImage?.path,
    path: `/works/${c.slug}`,
    type: "article",
  });
}

export function loader({ params }: Route.LoaderArgs) {
  const item = getCaseStudy(params.slug);
  if (!item) throw new Response("Not found", { status: 404 });
  return { item };
}

const META_ROWS: { key: "client" | "industry" | "year" | "services"; label: string }[] = [
  { key: "client", label: "Client" },
  { key: "industry", label: "Industry" },
  { key: "year", label: "Year" },
  { key: "services", label: "Services" },
];

export default function CaseStudyDetail({ loaderData }: Route.ComponentProps) {
  const c = loaderData.item;
  const sections = c.sections ?? [];
  return (
    <article>
      <JsonLd
        data={articleJsonLd({
          title: c.title,
          description: c.excerpt,
          path: `/works/${c.slug}`,
          image: c.ogImage ?? c.coverImage?.path,
          publishedAt: c.publishedAt,
          updatedAt: c.updatedAt,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Case Studies", path: "/works" },
          { name: c.title, path: `/works/${c.slug}` },
        ])}
      />

      <CaseStudyHero
        title={c.title}
        lead={c.excerpt}
        eyebrow={c.heroEyebrow || undefined}
        readouts={c.readouts ?? []}
        cover={c.coverImage}
      />

      {(c.client || c.industry || c.year || c.services.length > 0) && (
        <Section spacing="compact">
          <Container>
            <dl className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
              {META_ROWS.map(({ key, label }) => {
                const value =
                  key === "services" ? c.services.join(", ") : (c[key] ?? "");
                if (!value) return null;
                return (
                  <div key={key}>
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="mt-1 font-medium text-gray-900 dark:text-white">
                      {value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Container>
        </Section>
      )}

      {sections.length > 0 ? (
        <CaseStudySections sections={sections} />
      ) : c.bodyHtml ? (
        <Section>
          <Container>
            <div className="mx-auto max-w-3xl">
              <Prose html={c.bodyHtml} />
            </div>
          </Container>
        </Section>
      ) : null}

      <Section spacing="compact">
        <Container>
          {c.gallery.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {c.gallery.map((g) => (
                <Img
                  key={g.path}
                  media={g}
                  sizes="(min-width: 640px) 540px, 100vw"
                  className="w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          {c.url && (
            <p className={c.gallery.length > 0 ? "mt-12" : undefined}>
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Visit live project →
              </a>
            </p>
          )}

          <p className={c.gallery.length > 0 || c.url ? "mt-12" : undefined}>
            <Link
              to="/works"
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              ← All case studies
            </Link>
          </p>
        </Container>
      </Section>

      <FinalCta content={siteContent.home.finalCta} />
    </article>
  );
}
