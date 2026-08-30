import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { imageSize } from "image-size";
import { connectDb } from "~/lib/db.server";
import { env } from "~/lib/env.server";
import { Media } from "~/lib/models/media.server";
import { FieldError } from "~/lib/admin.server";
import { toSlug } from "~/lib/slug";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "application/pdf",
]);

/** Persist one uploaded file to `public/uploads/YYYY/MM/` and record metadata. */
export async function saveUpload(file: File, uploadedBy?: string) {
  if (!(file instanceof File) || file.size === 0) {
    throw new FieldError("file", "No file was uploaded.");
  }
  if (!ALLOWED.has(file.type)) {
    throw new FieldError("file", `Unsupported file type: ${file.type}`);
  }
  const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new FieldError("file", `File exceeds ${env.MAX_UPLOAD_MB} MB limit.`);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 10);

  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  const base = toSlug(dot >= 0 ? file.name.slice(0, dot) : file.name) || "file";
  const filename = `${hash}-${base}${ext}`;
  const relDir = `uploads/${yyyy}/${mm}`;
  const relPath = `/${relDir}/${filename}`;

  await connectDb();
  const existing = await Media.findOne({ path: relPath });
  if (existing) return existing.toObject();

  await mkdir(join("public", relDir), { recursive: true });
  await writeFile(join("public", relDir, filename), buf);

  let width: number | undefined;
  let height: number | undefined;
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
    try {
      const dim = imageSize(buf);
      width = dim.width;
      height = dim.height;
    } catch {
      /* non-fatal */
    }
  }

  const doc = await Media.create({
    filename,
    originalName: file.name,
    path: relPath,
    mimeType: file.type,
    size: file.size,
    width,
    height,
    uploadedBy,
  });
  return doc.toObject();
}
