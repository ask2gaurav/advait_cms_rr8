import type { Route } from "./+types/services";
import { getPage } from "~/lib/content";
import { buildMeta, serviceJsonLd } from "~/lib/seo";
import { siteContent } from "~/lib/site-content";
import { Container, JsonLd, PageHero, Prose } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { FeatureBlocks } from "~/components/FeatureBlocks";
import { FinalCta } from "~/components/home/FinalCta";

const content = siteContent.pages.services;

export function meta({ loaderData }: Route.MetaArgs) {
  const page = loaderData?.page;
  return buildMeta({
    title: page?.seoTitle ?? content.hero.title,
    description: page?.seoDescription ?? content.hero.lead,
    path: "/services",
  });
}

export function loader() {
  return { page: getPage("services") ?? null };
}

export default function Services({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "AI-accelerated software engineering",
          description: content.hero.lead,
          path: "/services",
        })}
      />
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={page?.title ?? content.hero.title}
        lead={page?.excerpt ?? content.hero.lead}
      />

      <Section cmsSection={content.cmsSection}>
        <Container>
          <FeatureBlocks blocks={content.blocks} />
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
