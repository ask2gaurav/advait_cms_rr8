import { getSettings } from "~/lib/content";

export function loader() {
  const { siteUrl } = getSettings();
  const body = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${siteUrl}/sitemap.xml
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
