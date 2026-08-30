import { Section } from "~/components/layout/Section";
import { Container } from "~/components/site";
import { SectionHeading } from "~/components/layout/SectionHeading";
import { Icon } from "~/components/Icon";
import { CodeGlyph } from "~/components/visuals/CodeGlyph";
import type { siteContent } from "~/lib/site-content";

type Content = typeof siteContent.home.capabilities;

export function AiCapabilities({ content }: { content: Content }) {
  return (
    <Section bg="ink" cmsSection="ai-capabilities" className="overflow-hidden">
      <CodeGlyph className="absolute -right-12 top-1/2 h-72 w-72 -translate-y-1/2 opacity-40" />
      <Container className="relative">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={<span className="text-white">{content.title}</span>}
          lead={<span className="text-gray-300">{content.lead}</span>}
        />
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map((it) => (
            <li
              key={it.title}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
                <Icon name={it.icon} />
              </span>
              <span className="text-sm font-medium text-white">{it.title}</span>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
