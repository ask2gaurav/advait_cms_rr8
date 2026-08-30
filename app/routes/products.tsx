import type { Route } from "./+types/products";
import { getPage } from "~/lib/content";
import { buildMeta, serviceJsonLd } from "~/lib/seo";
import { siteContent } from "~/lib/site-content";
import { Container, JsonLd, PageHero, Prose } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { FeatureBlocks } from "~/components/FeatureBlocks";
import { FinalCta } from "~/components/home/FinalCta";

const content = siteContent.pages.products;

export function meta({ loaderData }: Route.MetaArgs) {
  const page = loaderData?.page;
  return buildMeta({
    title: page?.seoTitle ?? content.hero.title,
    description: page?.seoDescription ?? content.hero.lead,
    path: "/products",
  });
}

export function loader() {
  return { page: getPage("products") ?? null };
}

export default function Products({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Production RAG & multi-agent systems",
          description: content.hero.lead,
          path: "/products",
        })}
      />
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={page?.title ?? content.hero.title}
        lead={page?.excerpt ?? content.hero.lead}
      />

      <Section cmsSection={content.cmsSection}>
        <Container>
          <FeatureBlocks blocks={content.blocks} columns={3} />
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
