import { z } from "zod";

/** Shared field validators used by admin forms + actions. */

const status = z.enum(["draft", "published", "archived"]);
const slug = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only");

const seo = {
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(400).optional().or(z.literal("")),
};

/** BlockNote document: an array of blocks. Stored as-is. */
const richText = z.array(z.any()).default([]);

const csv = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

export const pageSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug,
  status,
  template: z.string().trim().min(1).default("default"),
  excerpt: z.string().trim().max(600).optional().or(z.literal("")),
  body: richText,
  ...seo,
  ogImage: z.string().trim().optional().or(z.literal("")),
});

export const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug,
  status,
  excerpt: z.string().trim().max(600).optional().or(z.literal("")),
  body: richText,
  coverImage: z.string().trim().optional().or(z.literal("")),
  ogImage: z.string().trim().optional().or(z.literal("")),
  tags: csv,
  categories: csv,
  author: z.string().trim().optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  ...seo,
});

export const caseStudySchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug,
  status,
  excerpt: z.string().trim().max(600).optional().or(z.literal("")),
  body: richText,
  coverImage: z.string().trim().optional().or(z.literal("")),
  ogImage: z.string().trim().optional().or(z.literal("")),
  gallery: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  client: z.string().trim().optional().or(z.literal("")),
  industry: z.string().trim().optional().or(z.literal("")),
  services: csv,
  year: z.coerce.number().int().min(1970).max(2100).optional(),
  url: z.string().trim().url().optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  order: z.coerce.number().int().optional(),
  ...seo,
});

export const userSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1),
  role: z.enum(["master", "admin"]),
  active: z.preprocess((v) => v === "true" || v === "on" || v === true, z.boolean()),
  password: z.string().min(8).optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1),
  siteUrl: z.string().trim().url(),
  tagline: z.string().trim().optional().or(z.literal("")),
  defaultSeoTitle: z.string().trim().optional().or(z.literal("")),
  defaultSeoDescription: z.string().trim().optional().or(z.literal("")),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  contactPhone: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  twitter: z.string().trim().optional().or(z.literal("")),
  linkedin: z.string().trim().optional().or(z.literal("")),
  github: z.string().trim().optional().or(z.literal("")),
});

/** Parse a FormData body with a Zod schema; `body` field is JSON-encoded. */
export function parseForm<T extends z.ZodTypeAny>(
  schema: T,
  form: FormData,
): z.infer<T> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    if (key === "body" && typeof value === "string") {
      raw.body = value ? JSON.parse(value) : [];
    } else {
      raw[key] = value;
    }
  }
  return schema.parse(raw);
}
