import type { ReactNode } from "react";
import type { CaseStudySectionPublic } from "~/lib/types";
import { Section, Container } from "~/components/layout/Section";
import { Prose } from "~/components/site";
import { Badge } from "~/components/ui/Badge";
import { cn } from "~/lib/utils";
import { BeforeAfterDiagram } from "~/components/case-study/BeforeAfterDiagram";

/* ------------------------------------------------------------------ helpers */

type Bg = "default" | "mist" | "ink";

function SectionShell({
  kicker,
  title,
  ledeHtml,
  bg = "default",
  children,
}: {
  kicker?: string;
  title?: string;
  ledeHtml?: string;
  bg?: Bg;
  children?: ReactNode;
}) {
  const onDark = bg === "ink";
  return (
    <Section bg={bg}>
      <Container>
        {(kicker || title) && (
          <div className="max-w-2xl">
            {kicker && (
              <p
                className={cn(
                  "font-mono text-base font-semibold uppercase tracking-wide",
                  onDark ? "text-brand-400" : "text-brand-600 dark:text-brand-400",
                )}
              >
                {kicker}
              </p>
            )}
            {title && (
              <h2
                className={cn(
                  "mt-3 text-3xl font-semibold tracking-tight sm:text-4xl",
                  onDark ? "text-white" : "text-gray-900 dark:text-white",
                )}
              >
                {title}
              </h2>
            )}
          </div>
        )}
        {ledeHtml && (
          <div className="mt-5 max-w-2xl">
            <Prose html={ledeHtml} />
          </div>
        )}
        {children && <div className="mt-10">{children}</div>}
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- renderers */

type Data<T extends CaseStudySectionPublic["type"]> = Extract<
  CaseStudySectionPublic,
  { type: T }
>["data"];

function ChallengeSection({ data }: { data: Data<"challenge"> }) {
  return (
    <SectionShell kicker={data.kicker} title={data.title} ledeHtml={data.introHtml}>
      <ol className="grid gap-8 sm:grid-cols-2">
        {data.items.map((item, i) => (
          <li key={i} className="flex gap-4">
            <span className="mt-0.5 font-mono text-sm text-brand-600 dark:text-brand-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h3>
              {item.bodyHtml && (
                <div className="mt-1">
                  <Prose html={item.bodyHtml} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

const NODE_DOT: Record<Data<"journey">["nodes"][number]["status"], string> = {
  "dead-end": "bg-gray-300 dark:bg-gray-600",
  breakthrough: "bg-brand-500",
  milestone: "bg-gray-900 dark:bg-white",
};
const NODE_LABEL: Record<Data<"journey">["nodes"][number]["status"], string> = {
  "dead-end": "Dead end",
  breakthrough: "Breakthrough",
  milestone: "Milestone",
};

function JourneySection({ data }: { data: Data<"journey"> }) {
  return (
    <SectionShell kicker={data.kicker} title={data.title} ledeHtml={data.ledeHtml}>
      <ol className="relative space-y-10 border-l border-gray-200 pl-8 dark:border-gray-800">
        {data.nodes.map((node, i) => (
          <li key={i} className="relative">
            <span
              className={cn(
                "absolute -left-[calc(2rem+0.3125rem)] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-gray-950",
                NODE_DOT[node.status],
              )}
            />
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {NODE_LABEL[node.status]}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {node.title}
            </h3>
            {node.bodyHtml && (
              <div className="mt-2">
                <Prose html={node.bodyHtml} />
              </div>
            )}
          </li>
        ))}
      </ol>
      {data.architecture && (
        <BeforeAfterDiagram architecture={data.architecture} />
      )}
      {data.diagram && (
        <figure className="mt-10">
          <img
            src={data.diagram.path}
            alt={data.diagram.alt ?? ""}
            width={data.diagram.width ?? 1200}
            height={data.diagram.height ?? 675}
            loading="lazy"
            decoding="async"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800"
          />
        </figure>
      )}
    </SectionShell>
  );
}

function SolutionSection({ data }: { data: Data<"solution"> }) {
  return (
    <SectionShell kicker={data.kicker} title={data.title} ledeHtml={data.ledeHtml}>
      <div className="grid gap-6 sm:grid-cols-2">
        {data.cards.map((card, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
          >
            {card.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {card.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {card.title}
            </h3>
            {card.bodyHtml && (
              <div className="mt-2">
                <Prose html={card.bodyHtml} />
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function EvolutionShot({
  media,
  label,
}: {
  media?: Data<"evolution">["rows"][number]["before"];
  label: string;
}) {
  if (media) {
    return (
      <figure>
        <img
          src={media.path}
          alt={media.alt ?? label}
          width={media.width ?? 800}
          height={media.height ?? 600}
          loading="lazy"
          decoding="async"
          className="w-full rounded-lg border border-gray-200 object-cover dark:border-gray-800"
        />
        <figcaption className="mt-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </figcaption>
      </figure>
    );
  }
  return (
    <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-gray-300 bg-mist text-xs font-semibold uppercase tracking-widest text-gray-500 dark:border-gray-700 dark:bg-gray-900">
      {label}
    </div>
  );
}

function EvolutionSection({ data }: { data: Data<"evolution"> }) {
  const showcase = data.showcase ?? [];
  return (
    <SectionShell kicker={data.kicker} title={data.title} ledeHtml={data.ledeHtml}>
      <div className="space-y-12">
        {data.rows.map((row, i) => (
          <div key={i}>
            <div className="grid gap-4 sm:grid-cols-2">
              <EvolutionShot media={row.before} label={row.beforeLabel || "Before"} />
              <EvolutionShot media={row.after} label={row.afterLabel || "After"} />
            </div>
            {row.captionHtml && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <Prose html={row.captionHtml} />
              </div>
            )}
          </div>
        ))}
      </div>

      {showcase.length > 0 && (
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {showcase.map((item, i) => (
            <div key={i}>
              {item.image && (
                <img
                  src={item.image.path}
                  alt={item.image.alt ?? ""}
                  width={item.image.width ?? 800}
                  height={item.image.height ?? 600}
                  loading="lazy"
                  decoding="async"
                  className="mb-3 w-full rounded-lg border border-gray-200 object-cover dark:border-gray-800"
                />
              )}
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                {item.label || "New in Production"}
              </p>
              {item.bodyHtml && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <Prose html={item.bodyHtml} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function ResultsSection({ data }: { data: Data<"results"> }) {
  return (
    <SectionShell
      kicker={data.kicker}
      title={data.title}
      ledeHtml={data.ledeHtml}
      bg="mist"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.tiles.map((tile, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
          >
            <p className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {tile.value}
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
              {tile.label}
            </p>
            {tile.detail && (
              <p className="mt-1 text-sm text-gray-500">{tile.detail}</p>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function ConclusionSection({ data }: { data: Data<"conclusion"> }) {
  return (
    <SectionShell
      kicker={data.kicker}
      title={data.title}
      ledeHtml={data.ledeHtml}
      bg="ink"
    >
      {data.bodyHtml && (
        <div className="prose-content prose-content-invert max-w-2xl">
          <div dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
        </div>
      )}
      {data.signoff && (
        <p className="mt-8 text-lg font-medium text-white">{data.signoff}</p>
      )}
    </SectionShell>
  );
}

function ProseSection({ data }: { data: Data<"prose"> }) {
  return (
    <SectionShell title={data.title}>
      {data.bodyHtml && (
        <div className="max-w-3xl">
          <Prose html={data.bodyHtml} />
        </div>
      )}
    </SectionShell>
  );
}

/* -------------------------------------------------------------- switchboard */

const NUMBERED = new Set<CaseStudySectionPublic["type"]>([
  "challenge",
  "journey",
  "solution",
  "evolution",
  "results",
  "conclusion",
]);

/** Final eyebrow string: explicit `kicker` wins, else `NN — label`. */
function composeKicker(
  data: { kicker?: string; label?: string },
  autoNumber?: string,
): string | undefined {
  if (data.kicker) return data.kicker;
  return [autoNumber, data.label].filter(Boolean).join(" — ") || undefined;
}

export function CaseStudySections({
  sections = [],
}: {
  sections?: CaseStudySectionPublic[];
}) {
  let n = 0;
  return (
    <>
      {sections.map((section, i) => {
        const autoNumber = NUMBERED.has(section.type)
          ? String(++n).padStart(2, "0")
          : undefined;
        switch (section.type) {
          case "challenge":
            return (
              <ChallengeSection
                key={i}
                data={{ ...section.data, kicker: composeKicker(section.data, autoNumber) }}
              />
            );
          case "journey":
            return (
              <JourneySection
                key={i}
                data={{ ...section.data, kicker: composeKicker(section.data, autoNumber) }}
              />
            );
          case "solution":
            return (
              <SolutionSection
                key={i}
                data={{ ...section.data, kicker: composeKicker(section.data, autoNumber) }}
              />
            );
          case "evolution":
            return (
              <EvolutionSection
                key={i}
                data={{ ...section.data, kicker: composeKicker(section.data, autoNumber) }}
              />
            );
          case "results":
            return (
              <ResultsSection
                key={i}
                data={{ ...section.data, kicker: composeKicker(section.data, autoNumber) }}
              />
            );
          case "conclusion":
            return (
              <ConclusionSection
                key={i}
                data={{ ...section.data, kicker: composeKicker(section.data, autoNumber) }}
              />
            );
          case "prose":
            return <ProseSection key={i} data={section.data} />;
          default:
            return null;
        }
      })}
    </>
  );
}
