import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { connectDb } from "~/lib/db.server";
import { Media } from "~/lib/models/media.server";
import { Page } from "~/lib/models/page.server";
import { Post } from "~/lib/models/post.server";
import { CaseStudy } from "~/lib/models/case-study.server";
import { Setting } from "~/lib/models/setting.server";
import { FieldError } from "~/lib/admin.server";

export interface MediaListItem {
  id: string;
  path: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  isImage: boolean;
}

export async function listMedia(): Promise<MediaListItem[]> {
  await connectDb();
  const docs = await Media.find().sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    path: d.path,
    originalName: d.originalName,
    mimeType: d.mimeType,
    size: d.size,
    width: d.width,
    height: d.height,
    alt: d.alt,
    isImage: d.mimeType.startsWith("image/"),
  }));
}

export async function updateMediaAlt(id: string, alt: string) {
  await connectDb();
  await Media.findByIdAndUpdate(id, { alt: alt.trim() || undefined });
}

/** Count references to a media doc across content, so we can block deletes. */
async function countReferences(id: string) {
  const [pages, posts, cases, settings] = await Promise.all([
    Page.countDocuments({ ogImage: id }),
    Post.countDocuments({ $or: [{ coverImage: id }, { ogImage: id }] }),
    CaseStudy.countDocuments({
      $or: [{ coverImage: id }, { ogImage: id }, { gallery: id }],
    }),
    Setting.countDocuments({
      $or: [{ logo: id }, { favicon: id }, { defaultOgImage: id }],
    }),
  ]);
  return pages + posts + cases + settings;
}

export async function deleteMedia(id: string) {
  await connectDb();
  const doc = await Media.findById(id);
  if (!doc) return;
  if ((await countReferences(id)) > 0) {
    throw new FieldError(
      "_",
      "This file is still referenced by content. Remove those references first.",
    );
  }
  await Media.findByIdAndDelete(id);
  try {
    await unlink(join("public", doc.path.replace(/^\//, "")));
  } catch {
    /* file may already be gone */
  }
}
