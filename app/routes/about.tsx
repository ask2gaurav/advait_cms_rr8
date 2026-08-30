import type { Route } from "./+types/about";
import { getPage } from "~/lib/content";
import { buildMeta, organizationJsonLd } from "~/lib/seo";
import { siteContent } from "~/lib/site-content";
import { Container, JsonLd, PageHero, Prose } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { SectionHeading } from "~/components/layout/SectionHeading";
import { Icon } from "~/components/Icon";
import { FinalCta } from "~/components/home/FinalCta";

const content = siteContent.pages.about;

export function meta({ loaderData }: Route.MetaArgs) {
  const page = loaderData?.page;
  return buildMeta({
    title: page?.seoTitle ?? content.hero.title,
    description: page?.seoDescription ?? content.hero.lead,
    path: "/about",
  });
}

export function loader() {
  return { page: getPage("about") ?? null };
}

export default function About({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={page?.title ?? content.hero.title}
        lead={page?.excerpt ?? content.hero.lead}
      />

      <Section bg="ink" spacing="compact" cmsSection={content.cmsSection}>
        <Container>
          <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {content.stats.map((s) => (
              <div key={s.label}>
                <dt className="text-3xl font-semibold text-brand-400">{s.value}</dt>
                <dd className="mt-1 text-sm text-gray-300">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="What we value" title="How we work" />
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {content.values.map((v) => (
              <article key={v.title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Icon name={v.icon} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {v.body}
                </p>
              </article>
            ))}
          </div>
          {page?.bodyHtml && (
            <div className="mt-16 border-t border-gray-200 pt-12 dark:border-gray-800">
              <Prose html={page.bodyHtml} />
            </div>
          )}
        </Container>
      </Section>

      <FinalCta content={siteContent.home.finalCta} />
    </>
  );
}
