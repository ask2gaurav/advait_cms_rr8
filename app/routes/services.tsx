import type { Route } from "./+types/services";
import { getPage } from "~/lib/content";
import { buildMeta, serviceJsonLd } from "~/lib/seo";
import { siteContent } from "~/lib/site-content";
import { Container, JsonLd, PageHero, Prose } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { SectionHeading } from "~/components/layout/SectionHeading";
import { FeatureBlocks } from "~/components/FeatureBlocks";
import { FinalCta } from "~/components/home/FinalCta";
import { Icon, type IconName } from "~/components/Icon";
import { Badge } from "~/components/ui/Badge";
import { CTALink } from "~/components/ui/CTALink";
import { buttonVariants } from "~/components/ui/button";
import { Img } from "~/components/Img";
import { cn } from "~/lib/utils";

const content = siteContent.pages.services;

export function meta({ loaderData }: Route.MetaArgs) {
  const page = loaderData?.page;
  return buildMeta({
    title: page?.seoTitle ?? content.hero.title,
    description: page?.seoDescription ?? content.hero.lead,
    image: page?.ogImage ?? page?.coverImage?.path,
    path: "/services",
  });
}

export function loader() {
  return { page: getPage("services") ?? null };
}

function ModelCard({
  icon,
  title,
  badge,
  summary,
  points,
}: {
  icon: IconName;
  title: string;
  badge?: string;
  summary: string;
  points: string[];
}) {
  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Icon name={icon} />
        </span>
        {badge && <Badge variant="brand">{badge}</Badge>}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{summary}</p>
      <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <Icon name="checkCircle" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </article>
  );
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
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <CTALink href={content.hero.primaryCta.href} variant="brand" size="xl">
            {content.hero.primaryCta.label}
          </CTALink>
          {/* Plain anchor (not <Link>) so the browser's native hash-scroll applies. */}
          <a
            href={content.hero.secondaryCta.href}
            className={cn(buttonVariants({ variant: "brandOutline", size: "xl" }))}
          >
            {content.hero.secondaryCta.label}
          </a>
        </div>
        {page?.coverImage && (
          <Img
            media={page.coverImage}
            priority
            sizes="(min-width: 1280px) 1104px, 100vw"
            className="mt-10 w-full rounded-xl border border-gray-200 object-cover dark:border-gray-800"
          />
        )}
      </PageHero>

      <Section cmsSection={content.cmsSection}>
        <Container>
          <SectionHeading eyebrow="Services Overview" title="What we do" />
          <div className="mt-10">
            <FeatureBlocks blocks={content.blocks} columns={2} />
          </div>
        </Container>
      </Section>

      <Section bg="mist">
        <Container>
          <SectionHeading
            eyebrow={content.pricingPhilosophy.eyebrow}
            title={content.pricingPhilosophy.title}
          />
          <div className="mt-6 max-w-3xl space-y-4 text-gray-600 dark:text-gray-400">
            {content.pricingPhilosophy.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="pricing-models">
        <Container>
          <SectionHeading
            eyebrow="Pricing Models"
            title="Old vs. New Pricing Strategy"
            lead="What changes when AI does more of the implementation work."
          />

          <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <Icon name={content.oldModel.icon} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {content.oldModel.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {content.oldModel.summary}
                </p>
              </div>
            </div>
            <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-gray-600 sm:grid-cols-2 dark:text-gray-400">
              {content.oldModel.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-gray-400">–</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-12 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            New AI-Era Models We Now Offer
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {content.newModels.map((m) => (
              <ModelCard key={m.title} {...m} />
            ))}
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
              <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Old Model
              </h4>
              <dl className="mt-4 space-y-4">
                {content.comparisonRows.map((r) => (
                  <div key={r.label}>
                    <dt className="text-xs text-gray-500">{r.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                      {r.old}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-xl border border-brand-300 bg-brand-50/40 p-6 dark:border-brand-500/30 dark:bg-brand-500/5">
              <h4 className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                New AI-Era Models
              </h4>
              <dl className="mt-4 space-y-4">
                {content.comparisonRows.map((r) => (
                  <div key={r.label}>
                    <dt className="text-xs text-gray-500">{r.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                      {r.new}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <Section bg="mist">
        <Container>
          <SectionHeading
            eyebrow="Example Pricing Ranges"
            title="What projects typically cost"
            lead="Starting-from ranges for US/Canada-based engagements — every project gets a final quote after discovery."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.pricingRanges.map((r) => (
              <div
                key={r.title}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Icon name="dollarSign" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {r.title}
                </h3>
                <p className="mt-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {r.range}
                </p>
                <p className="mt-1 text-xs text-gray-500">{r.note}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="How We Work" title="Engagement process" />
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {content.process.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-white dark:bg-white dark:text-charcoal">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
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

      <FinalCta content={content.finalCta} />
    </>
  );
}
