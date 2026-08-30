import { Link } from "react-router";
import { Section } from "~/components/layout/Section";
import { Container } from "~/components/site";
import { SectionHeading } from "~/components/layout/SectionHeading";
import { Icon } from "~/components/Icon";
import { GridMotif } from "~/components/visuals/GridMotif";
import type { siteContent } from "~/lib/site-content";

type Content = typeof siteContent.home.services;

export function ServicesSnapshot({ content }: { content: Content }) {
  return (
    <Section cmsSection="services">
      <Container>
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          lead={content.lead}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.cards.map((card) => (
            <article
              key={card.title}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-brand-500/40"
            >
              <GridMotif className="opacity-60" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Icon name={card.icon} />
              </div>
              <h3 className="relative mt-4 text-base font-semibold text-gray-900 dark:text-white">
                {card.title}
              </h3>
              <p className="relative mt-2 flex-1 text-sm text-gray-600 dark:text-gray-400">
                {card.blurb}
              </p>
              {card.href && (
                <Link
                  to={card.href}
                  className="relative mt-4 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  Learn more →
                </Link>
              )}
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
