import { connectDb } from "~/lib/db.server";
import { Page } from "~/lib/models/page.server";
import { pageSchema, parseForm } from "~/lib/validation";
import { inferBodyFormat, resolvePublishedAt } from "~/lib/admin.server";
import { toSlug } from "~/lib/slug";

export interface PageValues {
  title?: string;
  slug?: string;
  status?: string;
  template?: string;
  excerpt?: string;
  body?: unknown;
  bodyFormat?: "blocknote" | "lexical";
  ogImage?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export async function listPages() {
  await connectDb();
  const docs = await Page.find().sort({ updatedAt: -1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    slug: d.slug,
    status: d.status,
    template: d.template,
    updatedAt: (d.updatedAt as Date).toISOString(),
  }));
}

export async function getPageValues(id: string): Promise<PageValues | null> {
  await connectDb();
  const d = await Page.findById(id).lean();
  if (!d) return null;
  return {
    title: d.title,
    slug: d.slug,
    status: d.status,
    template: d.template,
    excerpt: d.excerpt,
    body: d.body ?? null,
    bodyFormat: inferBodyFormat(d.body, d.bodyFormat),
    ogImage: d.ogImage ? String(d.ogImage) : "",
    coverImage: d.coverImage ? String(d.coverImage) : "",
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
  };
}

export async function savePage(form: FormData, id?: string) {
  await connectDb();
  const input = parseForm(pageSchema, form);
  const slug = input.slug || toSlug(input.title);
  const existing = id ? await Page.findById(id) : null;
  const doc = existing ?? new Page();
  doc.set({
    ...input,
    slug,
    bodyFormat: input.bodyFormat || "blocknote",
    ogImage: input.ogImage || undefined,
    coverImage: input.coverImage || undefined,
    seoTitle: input.seoTitle || undefined,
    seoDescription: input.seoDescription || undefined,
    publishedAt: resolvePublishedAt(input.status, doc.publishedAt),
  });
  await doc.save();
}

export async function deletePage(id: string) {
  await connectDb();
  await Page.findByIdAndDelete(id);
}
