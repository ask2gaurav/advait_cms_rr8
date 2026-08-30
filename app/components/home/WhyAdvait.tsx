import { Section } from "~/components/layout/Section";
import { Container } from "~/components/site";
import { SectionHeading } from "~/components/layout/SectionHeading";
import { Icon } from "~/components/Icon";
import type { siteContent } from "~/lib/site-content";

type Content = typeof siteContent.home.why;

export function WhyAdvait({ content }: { content: Content }) {
  return (
    <Section bg="mist" cmsSection="why">
      <Container>
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          lead={content.lead}
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.points.map((p) => (
            <li
              key={p.title}
              className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Icon name={p.icon} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {p.blurb}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
