import { mkdir, writeFile } from "node:fs/promises";
import DOMPurify from "isomorphic-dompurify";
import { connectDb } from "~/lib/db.server";
import { Page } from "~/lib/models/page.server";
import { Post } from "~/lib/models/post.server";
import { CaseStudy } from "~/lib/models/case-study.server";
import { Menu } from "~/lib/models/menu.server";
import { Media } from "~/lib/models/media.server";
import { Setting } from "~/lib/models/setting.server";
import { CompanyHistory } from "~/lib/models/company-history.server";
import { readFileSync } from "node:fs";
import { blocksToHtml } from "~/lib/richtext";
import { lexicalToHtml } from "~/lib/lexical-html";
import type {
  CaseStudyPublic,
  CaseStudySectionPublic,
  CompanyHistoryPublic,
  ContentMeta,
  MediaPublic,
  OfficeStatus,
  OfficeType,
  MenuItemPublic,
  MenuPublic,
  PagePublic,
  PostPublic,
  SettingsPublic,
} from "~/lib/types";

const CONTENT_DIR = "content";

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

/**
 * Plain author prose (blank line = new paragraph) → sanitized HTML.
 * Pre-formed block-level tags are passed through untouched. Kept here (in the
 * server-only export module) so no non-`.server` file depends on it.
 */
function proseToHtml(input: unknown): string {
  const text = typeof input === "string" ? input.trim() : "";
  if (!text) return "";
  const html = text
    .split(/\n\s*\n/)
    .map((para) => {
      const chunk = para.trim();
      if (!chunk) return "";
      if (/^<(p|ul|ol|h[1-6]|blockquote|figure|table|div)[\s>]/i.test(chunk)) {
        return chunk;
      }
      return `<p>${chunk.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
  return sanitize(html);
}

type RawSection = { type?: string; data?: Record<string, unknown> };

/** Walk section blocks and register every referenced media id. */
function collectSectionMediaIds(
  sections: unknown,
  add: (v: unknown) => void,
): void {
  if (!Array.isArray(sections)) return;
  for (const raw of sections as RawSection[]) {
    const data = raw?.data ?? {};
    if (raw?.type === "journey") add(data.diagram);
    if (raw?.type === "evolution") {
      if (Array.isArray(data.rows)) {
        for (const row of data.rows as Record<string, unknown>[]) {
          add(row.before);
          add(row.after);
        }
      }
      if (Array.isArray(data.showcase)) {
        for (const s of data.showcase as Record<string, unknown>[]) {
          add(s.image);
        }
      }
    }
  }
}

/** Denormalize raw section blocks into the export-ready public shape. */
function buildCaseStudySections(
  sections: unknown,
  media: Map<string, MediaPublic>,
): CaseStudySectionPublic[] {
  if (!Array.isArray(sections)) return [];
  const pic = (v: unknown) =>
    v ? media.get(String(v)) ?? undefined : undefined;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const arr = (v: unknown): Record<string, unknown>[] =>
    Array.isArray(v) ? (v as Record<string, unknown>[]) : [];

  const obj = (v: unknown): Record<string, unknown> =>
    v && typeof v === "object" ? (v as Record<string, unknown>) : {};

  const out: CaseStudySectionPublic[] = [];
  for (const raw of sections as RawSection[]) {
    const d = raw?.data ?? {};
    const kicker = str(d.kicker) || undefined;
    const label = str(d.label) || undefined;
    const title = str(d.title) || undefined;
    switch (raw?.type) {
      case "challenge":
        out.push({
          type: "challenge",
          data: {
            kicker,
            label,
            title,
            introHtml: proseToHtml(d.intro),
            items: arr(d.items).map((i) => ({
              title: String(i.title ?? ""),
              bodyHtml: proseToHtml(i.body),
            })),
          },
        });
        break;
      case "journey": {
        const a = obj(d.architecture);
        const aBefore = obj(a.before);
        const aAfter = obj(a.after);
        const hasArchitecture =
          d.architecture && (Object.keys(aBefore).length || Object.keys(aAfter).length);
        out.push({
          type: "journey",
          data: {
            kicker,
            label,
            title,
            ledeHtml: proseToHtml(d.lede),
            nodes: arr(d.nodes).map((n) => ({
              status: (n.status as "dead-end" | "breakthrough" | "milestone") ??
                "milestone",
              title: String(n.title ?? ""),
              bodyHtml: proseToHtml(n.body),
            })),
            diagram: pic(d.diagram),
            architecture: hasArchitecture
              ? {
                  before: {
                    heading: str(aBefore.heading),
                    from: str(aBefore.from),
                    to: str(aBefore.to),
                    via: str(aBefore.via),
                    blocked: str(aBefore.blocked),
                  },
                  after: {
                    heading: str(aAfter.heading),
                    from: str(aAfter.from),
                    to: str(aAfter.to),
                    flows: Array.isArray(aAfter.flows)
                      ? (aAfter.flows as string[])
                      : [],
                  },
                  captionHtml: proseToHtml(a.caption),
                }
              : undefined,
          },
        });
        break;
      }
      case "solution":
        out.push({
          type: "solution",
          data: {
            kicker,
            label,
            title,
            ledeHtml: proseToHtml(d.lede),
            cards: arr(d.cards).map((c) => ({
              title: String(c.title ?? ""),
              bodyHtml: proseToHtml(c.body),
              tags: Array.isArray(c.tags) ? (c.tags as string[]) : [],
            })),
          },
        });
        break;
      case "evolution":
        out.push({
          type: "evolution",
          data: {
            kicker,
            label,
            title,
            ledeHtml: proseToHtml(d.lede),
            rows: arr(d.rows).map((r) => ({
              before: pic(r.before),
              after: pic(r.after),
              beforeLabel: str(r.beforeLabel),
              afterLabel: str(r.afterLabel),
              captionHtml: proseToHtml(r.caption),
            })),
            showcase: arr(d.showcase).map((s) => ({
              image: pic(s.image),
              label: str(s.label),
              bodyHtml: proseToHtml(s.body),
            })),
          },
        });
        break;
      case "results":
        out.push({
          type: "results",
          data: {
            kicker,
            label,
            title,
            ledeHtml: proseToHtml(d.lede),
            tiles: arr(d.tiles).map((t) => ({
              value: String(t.value ?? ""),
              label: String(t.label ?? ""),
              detail: str(t.detail),
            })),
          },
        });
        break;
      case "conclusion":
        out.push({
          type: "conclusion",
          data: {
            kicker,
            label,
            title,
            ledeHtml: proseToHtml(d.lede),
            bodyHtml: proseToHtml(d.body),
            signoff: str(d.signoff),
          },
        });
        break;
      case "prose":
        out.push({
          type: "prose",
          data: { title, bodyHtml: proseToHtml(d.body) },
        });
        break;
      default:
        break;
    }
  }
  return out;
}

function iso(d: unknown): string | undefined {
  return d instanceof Date ? d.toISOString() : d ? String(d) : undefined;
}

async function buildMediaMap(ids: Set<string>) {
  const map = new Map<string, MediaPublic>();
  if (ids.size === 0) return map;
  const docs = await Media.find({ _id: { $in: [...ids] } }).lean();
  for (const d of docs) {
    map.set(String(d._id), {
      id: String(d._id),
      path: d.path,
      mimeType: d.mimeType,
      width: d.width,
      height: d.height,
      alt: d.alt,
      title: d.title,
    });
  }
  return map;
}

/** `/uploads/...` → derived-variant metadata, from `npm run optimize:media`. */
const imageManifest: Record<string, { w: number[] }> = (() => {
  try {
    return JSON.parse(readFileSync(`${CONTENT_DIR}/image-manifest.json`, "utf8"));
  } catch {
    return {};
  }
})();

const RICHTEXT_IMG_SIZES = "(min-width: 768px) 720px, 100vw";

/**
 * Upgrade `<img src="/uploads/…">` in rich-text HTML to a responsive
 * `<picture>` when `optimize:media` has produced variants for that src.
 * Runs after sanitize on our own trusted markup.
 */
function responsiveBodyImages(html: string): string {
  return html.replace(/<img\b[^>]*?>/gi, (tag) => {
    const src = tag.match(/\bsrc="([^"]+)"/i)?.[1];
    if (!src) return tag;
    const entry = imageManifest[src];
    if (!entry || entry.w.length === 0) return tag;
    const base = src
      .replace(/\.[^./]+$/, "")
      .replace(/^\/uploads\//, "/uploads/_derived/");
    const srcset = (fmt: string) =>
      entry.w.map((w) => `${base}.${w}.${fmt} ${w}w`).join(", ");
    const imgWithSizes = /\bsizes=/i.test(tag)
      ? tag
      : tag.replace(/\/?>$/, ` sizes="${RICHTEXT_IMG_SIZES}">`);
    return (
      `<picture>` +
      `<source type="image/avif" srcset="${srcset("avif")}" sizes="${RICHTEXT_IMG_SIZES}">` +
      `<source type="image/webp" srcset="${srcset("webp")}" sizes="${RICHTEXT_IMG_SIZES}">` +
      `${imgWithSizes}</picture>`
    );
  });
}

/** Render a stored rich-text `body` to sanitized HTML, per its editor format. */
function bodyToHtml(body: unknown, format?: string): string {
  const useLexical =
    format === "lexical" ||
    (!format && body != null && typeof body === "object" && !Array.isArray(body));
  const html = sanitize(useLexical ? lexicalToHtml(body) : blocksToHtml(body));
  return responsiveBodyImages(html);
}

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

export async function exportContent() {
  await connectDb();

  const [pages, posts, cases, menus, setting, history] = await Promise.all([
    Page.find({ status: "published" }).sort({ order: 1, title: 1 }).lean(),
    Post.find({ status: "published" }).sort({ publishedAt: -1 }).lean(),
    CaseStudy.find({ status: "published" }).sort({ order: 1, publishedAt: -1 }).lean(),
    Menu.find({ isActive: true }).lean(),
    Setting.findOne({ key: "site" }).lean(),
    CompanyHistory.findOne({ key: "company-history" }).lean(),
  ]);

  // Collect every referenced media id.
  const mediaIds = new Set<string>();
  const add = (v: unknown) => v && mediaIds.add(String(v));
  pages.forEach((p) => {
    add(p.ogImage);
    add(p.coverImage);
  });
  posts.forEach((p) => {
    add(p.coverImage);
    add(p.ogImage);
  });
  cases.forEach((c) => {
    add(c.coverImage);
    add(c.ogImage);
    (c.gallery ?? []).forEach(add);
    collectSectionMediaIds(c.sections, add);
  });
  if (setting) {
    add(setting.logo);
    add(setting.favicon);
    add(setting.defaultOgImage);
  }
  (history?.logos ?? []).forEach((l) => add(l.image));
  const media = await buildMediaMap(mediaIds);

  const pagesOut: PagePublic[] = pages.map((p) => {
    const bodyHtml = bodyToHtml(p.body, p.bodyFormat);
    return {
      title: p.title,
      slug: p.slug,
      template: p.template,
      excerpt: p.excerpt,
      body: p.body ?? [],
      bodyHtml,
      coverImage: p.coverImage ? media.get(String(p.coverImage)) : undefined,
      order: p.order,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      ogImage: p.ogImage ? media.get(String(p.ogImage))?.path : undefined,
      publishedAt: iso(p.publishedAt),
      updatedAt: iso(p.updatedAt)!,
    };
  });

  const postsOut: PostPublic[] = posts.map((p) => {
    const bodyHtml = bodyToHtml(p.body, p.bodyFormat);
    return {
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      body: p.body ?? [],
      bodyHtml,
      coverImage: p.coverImage ? media.get(String(p.coverImage)) : undefined,
      tags: p.tags ?? [],
      categories: p.categories ?? [],
      author: p.author,
      readingTime: Math.max(1, Math.round(wordCount(bodyHtml) / 200)),
      featured: p.featured,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      ogImage: p.ogImage ? media.get(String(p.ogImage))?.path : undefined,
      publishedAt: iso(p.publishedAt),
      updatedAt: iso(p.updatedAt)!,
    };
  });

  const casesOut: CaseStudyPublic[] = cases.map((c) => {
    const bodyHtml = bodyToHtml(c.body, c.bodyFormat);
    return {
      title: c.title,
      slug: c.slug,
      excerpt: c.excerpt,
      body: c.body ?? [],
      bodyHtml,
      coverImage: c.coverImage ? media.get(String(c.coverImage)) : undefined,
      gallery: (c.gallery ?? [])
        .map((id) => media.get(String(id)))
        .filter((m): m is MediaPublic => Boolean(m)),
      client: c.client,
      industry: c.industry,
      services: c.services ?? [],
      year: c.year,
      url: c.url,
      featured: c.featured,
      order: c.order,
      heroEyebrow: c.heroEyebrow,
      readouts: (c.readouts ?? []).map((r) => ({
        label: String(r.label ?? ""),
        value: String(r.value ?? ""),
      })),
      sections: buildCaseStudySections(c.sections, media),
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
      ogImage: c.ogImage ? media.get(String(c.ogImage))?.path : undefined,
      publishedAt: iso(c.publishedAt),
      updatedAt: iso(c.updatedAt)!,
    };
  });

  const resolveItem = (item: Record<string, unknown>): MenuItemPublic => {
    let url = String(item.url ?? "#");
    if (item.type === "page" && item.page) {
      const p = pages.find((x) => String(x._id) === String(item.page));
      url = p ? `/${p.slug}` : url;
    } else if (item.type === "post" && item.post) {
      const p = posts.find((x) => String(x._id) === String(item.post));
      url = p ? `/blog/${p.slug}` : url;
    } else if (item.type === "caseStudy" && item.caseStudy) {
      const c = cases.find((x) => String(x._id) === String(item.caseStudy));
      url = c ? `/works/${c.slug}` : url;
    }
    return {
      label: String(item.label ?? ""),
      url,
      target: item.target === "_blank" ? "_blank" : "_self",
      children: Array.isArray(item.children)
        ? item.children
            .filter((c) => (c as { isVisible?: boolean }).isVisible !== false)
            .map((c) => resolveItem(c as Record<string, unknown>))
        : [],
    };
  };

  const menusOut: MenuPublic[] = menus.map((m) => ({
    name: m.name,
    location: m.location,
    items: (m.items ?? [])
      .filter((i) => (i as { isVisible?: boolean }).isVisible !== false)
      .sort((a, b) => ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0))
      .map((i) => resolveItem(i as unknown as Record<string, unknown>)),
  }));

  const social = (setting?.social ?? {}) as Record<string, string>;
  const settingsOut: SettingsPublic = {
    siteName: setting?.siteName ?? "My Site",
    siteUrl: (setting?.siteUrl ?? "https://example.com").replace(/\/$/, ""),
    tagline: setting?.tagline,
    logo: setting?.logo ? media.get(String(setting.logo)) : undefined,
    favicon: setting?.favicon ? media.get(String(setting.favicon)) : undefined,
    defaultSeoTitle: setting?.defaultSeoTitle,
    defaultSeoDescription: setting?.defaultSeoDescription,
    defaultOgImage: setting?.defaultOgImage
      ? media.get(String(setting.defaultOgImage))
      : undefined,
    social,
    contactEmail: setting?.contactEmail,
    contactPhone: setting?.contactPhone,
    address: setting?.address,
    clients: setting?.clients,
    integrations: (setting?.integrations ?? {}) as SettingsPublic["integrations"],
  };

  const companyHistoryOut: CompanyHistoryPublic = {
    introHtml: proseToHtml(history?.intro),
    addresses: (history?.addresses ?? [])
      .filter((a) => !a.hidden)
      .sort(
        (a, b) =>
          (a.order ?? 9999) - (b.order ?? 9999) ||
          (b.fromYear ?? 0) - (a.fromYear ?? 0),
      )
      .map((a) => ({
        label: a.label,
        lines: a.lines || undefined,
        city: a.city || undefined,
        country: a.country || undefined,
        type: (a.type as OfficeType) ?? "main-office",
        status: (a.status as OfficeStatus) ?? "open-current",
        fromYear: a.fromYear,
        toYear: a.toYear,
        note: a.note || undefined,
      })),
    logos: (history?.logos ?? [])
      .filter((l) => !l.hidden)
      .sort(
        (a, b) =>
          (a.order ?? 9999) - (b.order ?? 9999) ||
          (b.fromYear ?? 0) - (a.fromYear ?? 0),
      )
      .map((l) => ({
        image: l.image ? media.get(String(l.image)) : undefined,
        label: l.label || undefined,
        fromYear: l.fromYear,
        toYear: l.toYear,
        note: l.note || undefined,
      }))
      .filter((l) => l.image || l.label),
    seoTitle: history?.seoTitle,
    seoDescription: history?.seoDescription,
  };

  const meta: ContentMeta = {
    exportedAt: new Date().toISOString(),
    counts: {
      pages: pagesOut.length,
      posts: postsOut.length,
      caseStudies: casesOut.length,
      menus: menusOut.length,
      companyAddresses: companyHistoryOut.addresses.length,
      companyLogos: companyHistoryOut.logos.length,
    },
  };

  await mkdir(CONTENT_DIR, { recursive: true });
  const write = (name: string, data: unknown) =>
    writeFile(`${CONTENT_DIR}/${name}`, JSON.stringify(data, null, 2));

  await Promise.all([
    write("pages.json", pagesOut),
    write("posts.json", postsOut),
    write("case-studies.json", casesOut),
    write("menus.json", menusOut),
    write("settings.json", settingsOut),
    write("company-history.json", companyHistoryOut),
    write(".meta.json", meta),
  ]);

  return meta;
}
