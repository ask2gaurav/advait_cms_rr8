import type { Route } from "./+types/approach";
import { getPage } from "~/lib/content";
import { buildMeta } from "~/lib/seo";
import { siteContent } from "~/lib/site-content";
import { Container, PageHero, Prose } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { FinalCta } from "~/components/home/FinalCta";

const content = siteContent.pages.approach;

export function meta({ loaderData }: Route.MetaArgs) {
  const page = loaderData?.page;
  return buildMeta({
    title: page?.seoTitle ?? content.hero.title,
    description: page?.seoDescription ?? content.hero.lead,
    path: "/approach",
  });
}

export function loader() {
  return { page: getPage("approach") ?? null };
}

export default function Approach({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  return (
    <>
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={page?.title ?? content.hero.title}
        lead={page?.excerpt ?? content.hero.lead}
      />

      <Section cmsSection={content.cmsSection}>
        <Container>
          <ol className="relative space-y-10 border-l border-gray-200 pl-8 dark:border-gray-800">
            {content.steps.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
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
