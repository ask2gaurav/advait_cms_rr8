import { mkdir, writeFile } from "node:fs/promises";
import DOMPurify from "isomorphic-dompurify";
import { connectDb } from "~/lib/db.server";
import { Page } from "~/lib/models/page.server";
import { Post } from "~/lib/models/post.server";
import { CaseStudy } from "~/lib/models/case-study.server";
import { Menu } from "~/lib/models/menu.server";
import { Media } from "~/lib/models/media.server";
import { Setting } from "~/lib/models/setting.server";
import { blocksToHtml } from "~/lib/richtext";
import type {
  CaseStudyPublic,
  ContentMeta,
  MediaPublic,
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

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

export async function exportContent() {
  await connectDb();

  const [pages, posts, cases, menus, setting] = await Promise.all([
    Page.find({ status: "published" }).sort({ order: 1, title: 1 }).lean(),
    Post.find({ status: "published" }).sort({ publishedAt: -1 }).lean(),
    CaseStudy.find({ status: "published" }).sort({ order: 1, publishedAt: -1 }).lean(),
    Menu.find({ isActive: true }).lean(),
    Setting.findOne({ key: "site" }).lean(),
  ]);

  // Collect every referenced media id.
  const mediaIds = new Set<string>();
  const add = (v: unknown) => v && mediaIds.add(String(v));
  pages.forEach((p) => add(p.ogImage));
  posts.forEach((p) => {
    add(p.coverImage);
    add(p.ogImage);
  });
  cases.forEach((c) => {
    add(c.coverImage);
    add(c.ogImage);
    (c.gallery ?? []).forEach(add);
  });
  if (setting) {
    add(setting.logo);
    add(setting.favicon);
    add(setting.defaultOgImage);
  }
  const media = await buildMediaMap(mediaIds);

  const pagesOut: PagePublic[] = pages.map((p) => {
    const bodyHtml = sanitize(blocksToHtml(p.body));
    return {
      title: p.title,
      slug: p.slug,
      template: p.template,
      excerpt: p.excerpt,
      body: p.body ?? [],
      bodyHtml,
      order: p.order,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      ogImage: p.ogImage ? media.get(String(p.ogImage))?.path : undefined,
      publishedAt: iso(p.publishedAt),
      updatedAt: iso(p.updatedAt)!,
    };
  });

  const postsOut: PostPublic[] = posts.map((p) => {
    const bodyHtml = sanitize(blocksToHtml(p.body));
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
    const bodyHtml = sanitize(blocksToHtml(c.body));
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
    integrations: (setting?.integrations ?? {}) as SettingsPublic["integrations"],
  };

  const meta: ContentMeta = {
    exportedAt: new Date().toISOString(),
    counts: {
      pages: pagesOut.length,
      posts: postsOut.length,
      caseStudies: casesOut.length,
      menus: menusOut.length,
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
    write(".meta.json", meta),
  ]);

  return meta;
}
