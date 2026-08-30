import { getSettings } from "~/lib/content";

interface MetaInput {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

type MetaDescriptor = Record<string, unknown> & { title?: string };

function abs(url: string, path?: string) {
  if (!path) return url;
  if (path.startsWith("http")) return path;
  return `${url}${path}`;
}

function twitterHandle(twitterUrl?: string): string | undefined {
  if (!twitterUrl) return undefined;
  const m = twitterUrl.match(/(?:twitter\.com|x\.com)\/@?([A-Za-z0-9_]+)/);
  return m ? `@${m[1]}` : twitterUrl.startsWith("@") ? twitterUrl : undefined;
}

/** Build a React Router `meta` array with SEO + Open Graph + Twitter tags. */
export function buildMeta(input: MetaInput = {}): MetaDescriptor[] {
  const s = getSettings();
  const title = input.title
    ? `${input.title} — ${s.siteName}`
    : s.defaultSeoTitle || (s.tagline ? `${s.siteName} — ${s.tagline}` : s.siteName);
  const description = input.description || s.defaultSeoDescription || s.tagline || "";
  const url = abs(s.siteUrl, input.path);
  const image = input.image
    ? abs(s.siteUrl, input.image)
    : s.defaultOgImage
      ? abs(s.siteUrl, s.defaultOgImage.path)
      : undefined;
  const handle = twitterHandle(s.social?.twitter);

  const tags: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: s.siteName },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (handle) {
    tags.push({ name: "twitter:site", content: handle });
    tags.push({ name: "twitter:creator", content: handle });
  }
  if (image) {
    tags.push({ property: "og:image", content: image });
    tags.push({ property: "og:image:alt", content: title });
    tags.push({ name: "twitter:image", content: image });
  }
  if (input.noindex) tags.push({ name: "robots", content: "noindex,nofollow" });
  tags.push({ tagName: "link", rel: "canonical", href: url });
  return tags;
}

export function organizationJsonLd() {
  const s = getSettings();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.siteName,
    url: s.siteUrl,
    ...(s.tagline ? { slogan: s.tagline } : {}),
    ...(s.defaultSeoDescription ? { description: s.defaultSeoDescription } : {}),
    foundingDate: "2004",
    logo: s.logo ? abs(s.siteUrl, s.logo.path) : `${s.siteUrl}/icons/icon-512.png`,
    areaServed: ["US", "CA", "GB", "AE", "OM", "EU"],
    knowsAbout: [
      "Custom software development",
      "Retrieval-augmented generation",
      "Multi-agent AI systems",
      "AI-accelerated development",
      "Platform engineering",
    ],
    ...(s.contactEmail
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            email: s.contactEmail,
            contactType: "sales",
          },
        }
      : {}),
    sameAs: Object.values(s.social ?? {}).filter(Boolean),
  };
}

export function serviceJsonLd(input: { name: string; description: string; path: string }) {
  const s = getSettings();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: abs(s.siteUrl, input.path),
    provider: { "@type": "Organization", name: s.siteName, url: s.siteUrl },
    areaServed: ["US", "CA", "GB", "AE", "OM", "EU"],
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  const s = getSettings();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(s.siteUrl, c.path),
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
}) {
  const s = getSettings();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: abs(s.siteUrl, input.path),
    image: input.image ? abs(s.siteUrl, input.image) : undefined,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    author: input.author ? { "@type": "Person", name: input.author } : undefined,
    publisher: { "@type": "Organization", name: s.siteName },
  };
}
