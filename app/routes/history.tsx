import type { Route } from "./+types/history";
import { getCompanyHistory } from "~/lib/content";
import { siteContent } from "~/lib/site-content";
import { breadcrumbJsonLd, buildMeta } from "~/lib/seo";
import { Container, JsonLd, PageHero, Prose } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { Badge } from "~/components/ui/Badge";
import { GridMotif } from "~/components/visuals/GridMotif";
import { FinalCta } from "~/components/home/FinalCta";
import { Img } from "~/components/Img";
import type {
  CompanyAddressPublic,
  CompanyLogoPublic,
  OfficeStatus,
  OfficeType,
} from "~/lib/types";

export function meta() {
  const h = getCompanyHistory();
  return buildMeta({
    title: h.seoTitle || "Our History",
    description:
      h.seoDescription ||
      "Two decades of Advait Solutions — the offices we've worked from and the logos we've worn along the way.",
    path: "/history",
  });
}

export function loader() {
  return { history: getCompanyHistory() };
}

const TYPE_LABEL: Record<OfficeType, string> = {
  "main-office": "Main Office",
  branch: "Branch",
  "registered-office": "Registered Office",
};

const STATUS_LABEL: Record<OfficeStatus, string> = {
  "open-current": "Open / Current",
  "temporarily-closed": "Temporarily Closed",
  "permanently-closed": "Permanently Closed",
};

/** "2004 – 2012", "2019 – present", or "2004" when only one year is known. */
function yearRange(from?: number, to?: number): string {
  if (from && to) return `${from} – ${to}`;
  if (from) return `${from} – present`;
  if (to) return `until ${to}`;
  return "";
}

function LogoCard({ logo }: { logo: CompanyLogoPublic }) {
  const range = yearRange(logo.fromYear, logo.toYear);
  return (
    <figure className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex aspect-[16/9] items-center justify-center bg-mist p-8 dark:bg-gray-900">
        {logo.image ? (
          <Img
            media={logo.image}
            alt={logo.image.alt ?? logo.label ?? "Company logo"}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="max-h-full w-auto max-w-full object-contain"
          />
        ) : (
          <span className="text-sm text-gray-400">No image</span>
        )}
      </div>
      <figcaption className="flex flex-1 flex-col gap-1 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-gray-900 dark:text-white">
            {logo.label || "Logo"}
          </span>
          {range && (
            <span className="shrink-0 text-xs font-medium uppercase tracking-widest text-gray-500">
              {range}
            </span>
          )}
        </div>
        {logo.note && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{logo.note}</p>
        )}
      </figcaption>
    </figure>
  );
}

function AddressRow({ address }: { address: CompanyAddressPublic }) {
  const range = yearRange(address.fromYear, address.toYear);
  const isCurrent = address.status === "open-current";
  return (
    <li className="relative pl-8">
      <span
        className={
          "absolute left-0 top-1.5 h-3 w-3 rounded-full ring-4 ring-white dark:ring-gray-950 " +
          (isCurrent ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600")
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {address.label}
        </h3>
        <Badge variant="brand">{TYPE_LABEL[address.type]}</Badge>
        <Badge variant="outline">{STATUS_LABEL[address.status]}</Badge>
      </div>
      {range && (
        <p className="mt-1 text-xs font-medium uppercase tracking-widest text-gray-500">
          {range}
        </p>
      )}
      {(address.lines || address.city || address.country) && (
        <p className="mt-2 whitespace-pre-line text-sm text-gray-600 dark:text-gray-400">
          {[address.lines, address.city, address.country]
            .filter(Boolean)
            .join("\n")}
        </p>
      )}
      {address.note && (
        <p className="mt-2 text-sm text-gray-500">{address.note}</p>
      )}
    </li>
  );
}

export default function History({ loaderData }: Route.ComponentProps) {
  const { introHtml, addresses, logos } = loaderData.history;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Our History", path: "/history" }])}
      />
      <PageHero
        eyebrow="Archive"
        title="Our History"
        lead="Over 20 years our website, our logo and our office address have changed more than once. Here's the trail."
      />

      {introHtml && (
        <Section spacing="compact">
          <Container className="max-w-3xl">
            <Prose html={introHtml} />
          </Container>
        </Section>
      )}

      {logos.length > 0 && (
        <Section bg="mist">
          <Container>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              Logos over the years
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {logos.map((logo, i) => (
                <LogoCard key={i} logo={logo} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {addresses.length > 0 && (
        <Section>
          <Container>
            <div className="relative">
              <GridMotif className="text-gray-200/60 dark:text-white/[0.04]" />
              <div className="relative">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                  Office addresses
                </h2>
                <ol className="mt-10 space-y-10 border-l border-gray-200 pl-4 dark:border-gray-800">
                  {addresses.map((address, i) => (
                    <AddressRow key={i} address={address} />
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </Section>
      )}

      {logos.length === 0 && addresses.length === 0 && (
        <Section>
          <Container>
            <p className="text-gray-500">Nothing archived yet.</p>
          </Container>
        </Section>
      )}

      <FinalCta content={siteContent.home.finalCta} />
    </>
  );
}
