import type { Route } from "./+types/home";
import {
  getPageByTemplate,
  listCaseStudies,
} from "~/lib/content";
import { buildMeta, organizationJsonLd } from "~/lib/seo";
import { siteContent } from "~/lib/site-content";
import { JsonLd } from "~/components/site";
import { Hero } from "~/components/home/Hero";
import { ServicesSnapshot } from "~/components/home/ServicesSnapshot";
import { WhyAdvait } from "~/components/home/WhyAdvait";
import { FeaturedWork } from "~/components/home/FeaturedWork";
import { AiCapabilities } from "~/components/home/AiCapabilities";
import { FinalCta } from "~/components/home/FinalCta";

export function meta() {
  const page = getPageByTemplate("home");
  return buildMeta({
    title: page?.seoTitle ?? undefined,
    description:
      page?.seoDescription ?? siteContent.home.hero.subhead,
    path: "/",
  });
}

export function loader() {
  return {
    page: getPageByTemplate("home") ?? null,
    caseStudies: listCaseStudies().slice(0, 3),
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { caseStudies } = loaderData;
  const home = siteContent.home;

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Hero content={home.hero} />
      <ServicesSnapshot content={home.services} />
      <WhyAdvait content={home.why} />
      <FeaturedWork content={home.featuredWork} caseStudies={caseStudies} />
      <AiCapabilities content={home.capabilities} />
      <FinalCta content={home.finalCta} />
    </>
  );
}
