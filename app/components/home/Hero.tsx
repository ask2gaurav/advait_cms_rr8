import { Container } from "~/components/site";
import { CTALink } from "~/components/ui/CTALink";
import { NeuralMesh } from "~/components/visuals/NeuralMesh";
import { GradientField } from "~/components/visuals/GradientField";
import { TrustBar } from "~/components/home/TrustBar";
import type { siteContent } from "~/lib/site-content";

type HeroContent = typeof siteContent.home.hero;

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section
      data-cms-section="hero"
      className="relative isolate overflow-hidden border-b border-gray-200 bg-mist dark:border-gray-800 dark:bg-gray-950"
    >
      <GradientField />
      {/* mesh sits to the right; hidden on small screens where it competes with text */}
      <NeuralMesh className="left-auto right-0 hidden w-[60%] opacity-90 lg:block" />
      {/* readability wash: opaque behind the copy, clearing toward the mesh */}
      <div className="absolute inset-0 bg-linear-to-r from-mist via-mist/85 to-transparent dark:from-gray-950 dark:via-gray-950/85" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-mist to-transparent dark:from-gray-950" />

      <Container className="relative py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
            {content.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl dark:text-gray-300">
            {content.subhead}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CTALink href={content.primaryCta.href} variant="brand" size="xl">
              {content.primaryCta.label}
            </CTALink>
            <CTALink href={content.secondaryCta.href} variant="brandOutline" size="xl">
              {content.secondaryCta.label}
            </CTALink>
          </div>
        </div>
        <TrustBar items={content.trust} className="mt-12" />
      </Container>
    </section>
  );
}
