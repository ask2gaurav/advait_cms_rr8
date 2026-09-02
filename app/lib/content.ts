/**
 * Public-site content access. Reads ONLY the build-time JSON snapshots in
 * `/content` — never MongoDB. Regenerate with `npm run export`.
 */
import pagesJson from "../../content/pages.json";
import postsJson from "../../content/posts.json";
import casesJson from "../../content/case-studies.json";
import menusJson from "../../content/menus.json";
import settingsJson from "../../content/settings.json";
import historyJson from "../../content/company-history.json";
import type {
  CaseStudyPublic,
  CompanyHistoryPublic,
  MenuPublic,
  PagePublic,
  PostPublic,
  SettingsPublic,
} from "~/lib/types";

const pages = pagesJson as unknown as PagePublic[];
const posts = postsJson as unknown as PostPublic[];
const cases = casesJson as unknown as CaseStudyPublic[];
const menus = menusJson as unknown as MenuPublic[];
const settings = settingsJson as unknown as SettingsPublic;
const companyHistory = historyJson as unknown as CompanyHistoryPublic;

export function getSettings(): SettingsPublic {
  return settings;
}

export function getCompanyHistory(): CompanyHistoryPublic {
  return companyHistory;
}

export function getMenu(location: string): MenuPublic | undefined {
  return menus.find((m) => m.location === location);
}

export function listPages(): PagePublic[] {
  return pages;
}

export function getPage(slug: string): PagePublic | undefined {
  return pages.find((p) => p.slug === slug);
}

export function getPageByTemplate(template: string): PagePublic | undefined {
  return pages.find((p) => p.template === template);
}

export function listPosts(): PostPublic[] {
  return [...posts].sort((a, b) =>
    (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
  );
}

export function getPost(slug: string): PostPublic | undefined {
  return posts.find((p) => p.slug === slug);
}

export function listCaseStudies(): CaseStudyPublic[] {
  return [...cases].sort(
    (a, b) =>
      (a.order ?? 999) - (b.order ?? 999) ||
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
  );
}

export function getCaseStudy(slug: string): CaseStudyPublic | undefined {
  return cases.find((c) => c.slug === slug);
}

/** Slugs of custom pages (not bound to a known template / hard route). */
const RESERVED = new Set(["home", "about", "approach", "contact", "services", "products"]);
export function listCustomPageSlugs(): string[] {
  return pages.filter((p) => !RESERVED.has(p.slug)).map((p) => p.slug);
}
