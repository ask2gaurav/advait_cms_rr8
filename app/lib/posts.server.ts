import { connectDb } from "~/lib/db.server";
import { Post } from "~/lib/models/post.server";
import { postSchema, parseForm } from "~/lib/validation";
import { inferBodyFormat, resolvePublishedAt } from "~/lib/admin.server";
import { toSlug } from "~/lib/slug";
import type { PostValues } from "~/admin/PostForm";

export async function listPosts() {
  await connectDb();
  const docs = await Post.find().sort({ updatedAt: -1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    slug: d.slug,
    status: d.status,
    updatedAt: (d.updatedAt as Date).toISOString(),
  }));
}

export async function getPostValues(id: string): Promise<PostValues | null> {
  await connectDb();
  const d = await Post.findById(id).lean();
  if (!d) return null;
  return {
    title: d.title,
    slug: d.slug,
    status: d.status,
    excerpt: d.excerpt,
    body: d.body ?? null,
    bodyFormat: inferBodyFormat(d.body, d.bodyFormat),
    coverImage: d.coverImage ? String(d.coverImage) : "",
    ogImage: d.ogImage ? String(d.ogImage) : "",
    tags: d.tags,
    categories: d.categories,
    author: d.author,
    featured: d.featured,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
  };
}

export async function savePost(form: FormData, id?: string) {
  await connectDb();
  const input = parseForm(postSchema, form);
  const slug = input.slug || toSlug(input.title);

  const existing = id ? await Post.findById(id) : null;
  const doc = existing ?? new Post();

  doc.set({
    ...input,
    slug,
    bodyFormat: input.bodyFormat || "blocknote",
    coverImage: input.coverImage || undefined,
    ogImage: input.ogImage || undefined,
    author: input.author || undefined,
    seoTitle: input.seoTitle || undefined,
    seoDescription: input.seoDescription || undefined,
    publishedAt: resolvePublishedAt(input.status, doc.publishedAt),
  });
  await doc.save();
}

export async function deletePost(id: string) {
  await connectDb();
  await Post.findByIdAndDelete(id);
}
