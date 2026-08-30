import { connectDb } from "~/lib/db.server";
import { CaseStudy } from "~/lib/models/case-study.server";
import { caseStudySchema, parseForm } from "~/lib/validation";
import { resolvePublishedAt } from "~/lib/admin.server";
import { toSlug } from "~/lib/slug";

export interface CaseStudyValues {
  title?: string;
  slug?: string;
  status?: string;
  excerpt?: string;
  body?: unknown[];
  coverImage?: string;
  ogImage?: string;
  gallery?: string[];
  client?: string;
  industry?: string;
  services?: string[];
  year?: number;
  url?: string;
  featured?: boolean;
  order?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export async function listCaseStudies() {
  await connectDb();
  const docs = await CaseStudy.find().sort({ order: 1, updatedAt: -1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    slug: d.slug,
    client: d.client ?? "",
    status: d.status,
    updatedAt: (d.updatedAt as Date).toISOString(),
  }));
}

export async function getCaseStudyValues(
  id: string,
): Promise<CaseStudyValues | null> {
  await connectDb();
  const d = await CaseStudy.findById(id).lean();
  if (!d) return null;
  return {
    title: d.title,
    slug: d.slug,
    status: d.status,
    excerpt: d.excerpt,
    body: Array.isArray(d.body) ? (d.body as unknown[]) : [],
    coverImage: d.coverImage ? String(d.coverImage) : "",
    ogImage: d.ogImage ? String(d.ogImage) : "",
    gallery: (d.gallery ?? []).map(String),
    client: d.client,
    industry: d.industry,
    services: d.services,
    year: d.year,
    url: d.url,
    featured: d.featured,
    order: d.order,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
  };
}

export async function saveCaseStudy(form: FormData, id?: string) {
  await connectDb();
  const input = parseForm(caseStudySchema, form);
  const slug = input.slug || toSlug(input.title);
  const existing = id ? await CaseStudy.findById(id) : null;
  const doc = existing ?? new CaseStudy();
  doc.set({
    ...input,
    slug,
    coverImage: input.coverImage || undefined,
    ogImage: input.ogImage || undefined,
    client: input.client || undefined,
    industry: input.industry || undefined,
    url: input.url || undefined,
    seoTitle: input.seoTitle || undefined,
    seoDescription: input.seoDescription || undefined,
    publishedAt: resolvePublishedAt(input.status, doc.publishedAt),
  });
  await doc.save();
}

export async function deleteCaseStudy(id: string) {
  await connectDb();
  await CaseStudy.findByIdAndDelete(id);
}
