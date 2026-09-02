import {
  getSettings,
  listCaseStudies,
  listCustomPageSlugs,
  listPosts,
} from "~/lib/content";

export function loader() {
  const { siteUrl } = getSettings();
  const paths = [
    "/",
    "/about",
    "/approach",
    "/services",
    "/products",
    "/works",
    "/blog",
    "/history",
    "/contact",
    ...listCustomPageSlugs().map((s) => `/${s}`),
    ...listPosts().map((p) => `/blog/${p.slug}`),
    ...listCaseStudies().map((c) => `/works/${c.slug}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${siteUrl}${p}</loc></url>`).join("\n")}
</urlset>`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
}
