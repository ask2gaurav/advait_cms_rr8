import type { Route } from "./+types/page.$slug";
import { getPage } from "~/lib/content";
import { buildMeta } from "~/lib/seo";
import { TemplatePage } from "~/components/TemplatePage";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.page) return buildMeta({ title: "Not found", noindex: true });
  const p = loaderData.page;
  return buildMeta({
    title: p.seoTitle ?? p.title,
    description: p.seoDescription ?? p.excerpt,
    image: p.ogImage,
    path: `/${p.slug}`,
  });
}

export function loader({ params }: Route.LoaderArgs) {
  const page = getPage(params.slug);
  if (!page) throw new Response("Not found", { status: 404 });
  return { page };
}

export default function CustomPage({ loaderData }: Route.ComponentProps) {
  return <TemplatePage page={loaderData.page} />;
}
