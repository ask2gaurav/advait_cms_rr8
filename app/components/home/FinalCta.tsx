import { Container } from "~/components/site";
import { CTALink } from "~/components/ui/CTALink";
import { GridMotif } from "~/components/visuals/GridMotif";

export function FinalCta({
  content,
}: {
  content: { title: string; body: string; cta: { label: string; href: string } };
}) {
  return (
    <section
      data-cms-section="final-cta"
      className="relative isolate overflow-hidden border-t border-white/10 bg-charcoal py-20 text-white sm:py-24 dark:bg-black"
    >
      <GridMotif className="text-white/[0.06]" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl"
      />
      <Container className="relative text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {content.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-300">{content.body}</p>
        <CTALink href={content.cta.href} variant="brand" size="xl" className="mt-8">
          {content.cta.label}
        </CTALink>
      </Container>
    </section>
  );
}
