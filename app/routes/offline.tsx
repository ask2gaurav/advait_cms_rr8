import { buildMeta } from "~/lib/seo";
import { Container } from "~/components/site";
import { CTALink } from "~/components/ui/CTALink";

export function meta() {
  return buildMeta({ title: "Offline", description: "You are offline.", noindex: true });
}

export default function Offline() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
        No connection
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
        You're offline
      </h1>
      <p className="mt-3 max-w-md text-gray-600 dark:text-gray-300">
        This page isn't cached yet. Reconnect and try again — pages you've already
        visited will still work offline.
      </p>
      <CTALink href="/" variant="brand" size="lg" className="mt-8">
        Back to home
      </CTALink>
    </Container>
  );
}
