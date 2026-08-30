import type { PagePublic } from "~/lib/types";
import { Container, PageHero, Prose } from "~/components/site";
import { Section } from "~/components/layout/Section";

/** Generic renderer for a template-driven / custom CMS Page. */
export function TemplatePage({ page }: { page: PagePublic }) {
  return (
    <>
      <PageHero title={page.title} lead={page.excerpt} />
      {page.bodyHtml && (
        <Section>
          <Container className="max-w-3xl">
            <Prose html={page.bodyHtml} />
          </Container>
        </Section>
      )}
    </>
  );
}
