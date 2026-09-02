import type { Route } from "./+types/contact";
import { getPage, getSettings } from "~/lib/content";
import { buildMeta } from "~/lib/seo";
import { siteContent } from "~/lib/site-content";
import { Container, PageHero, Prose } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { TrustBar } from "~/components/home/TrustBar";

export function meta() {
  return buildMeta({
    title: "Contact",
    description:
      "Talk to a senior engineer about AI-accelerated delivery or a production RAG / agent system.",
    path: "/contact",
  });
}

export function loader() {
  const s = getSettings();
  return {
    page: getPage("contact") ?? null,
    settings: s,
    formEndpoint: s.integrations?.contactForm?.endpoint ?? "",
    calUrl: s.integrations?.calcom?.url ?? "",
  };
}

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

export default function Contact({ loaderData }: Route.ComponentProps) {
  const { page, settings, formEndpoint, calUrl } = loaderData;
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={page?.title ?? "Start a project"}
        lead={
          page?.excerpt ??
          "Tell us what you're building. A senior engineer will get back to you — not a sales bot."
        }
      />
      <Section>
        <Container className="grid gap-12 md:grid-cols-2">
          <div className="space-y-6">
            {page?.bodyHtml ? (
              <Prose html={page.bodyHtml} />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                We work with teams across the US, Canada, UK, Europe and the
                Middle East — offshore delivery without the friction.
              </p>
            )}
            <TrustBar items={siteContent.home.hero.trust} />
            <div className="space-y-1 border-t border-gray-200 pt-6 text-sm dark:border-gray-800">
              {settings.contactEmail && (
                <p>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    {settings.contactEmail}
                  </a>
                </p>
              )}
              {settings.contactPhone && (
                <p className="text-gray-600 dark:text-gray-400">
                  {settings.contactPhone}
                </p>
              )}
              {settings.address && (
                <p className="whitespace-pre-line text-gray-500">
                  {settings.address}
                </p>
              )}
              {settings.clients && (
                <p className="whitespace-pre-line text-gray-500">
                  {settings.clients}
                </p>
              )}
            </div>
          </div>

          <div>
            {formEndpoint ? (
              <form action={formEndpoint} method="post" className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium">
                    Name
                  </label>
                  <input id="name" name="name" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1 block text-sm font-medium">
                    What are you building?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-6 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Send message
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700">
                Add a contact-form endpoint in{" "}
                <span className="font-mono">Admin → Settings</span> to enable the
                form. Meanwhile, email us directly.
              </div>
            )}

            {calUrl && (
              <p className="mt-6 text-sm">
                <a
                  href={calUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  Prefer to talk? Book a discovery call →
                </a>
              </p>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
