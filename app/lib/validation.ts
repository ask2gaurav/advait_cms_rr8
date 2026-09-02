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

/**
 * Rich-text document, stored as-is. BlockNote serializes to an array of blocks;
 * Lexical serializes to a `{ root: … }` object — accept either.
 */
const richText = z.unknown();

/** Which editor produced `body` (persisted per document). */
const bodyFormat = z.enum(["blocknote", "lexical"]).optional();

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
  bodyFormat,
  ...seo,
  ogImage: z.string().trim().optional().or(z.literal("")),
});

export const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug,
  status,
  excerpt: z.string().trim().max(600).optional().or(z.literal("")),
  body: richText,
  bodyFormat,
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
  bodyFormat,
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
  heroEyebrow: z.string().trim().max(120).optional().or(z.literal("")),
  ...seo,
});

/* ---------------------------------------------------------------------------
 * Case-study structured content: hero readouts + ordered section blocks.
 * Authored as JSON in the admin (like Menu items). Prose fields are plain
 * multi-paragraph strings, rendered to sanitized HTML at export time.
 * ------------------------------------------------------------------------- */

const prose = z.string().trim();
const mediaId = z.string().trim().optional().or(z.literal(""));
const sectionBase = {
  kicker: z.string().trim().optional().or(z.literal("")),
  label: z.string().trim().optional().or(z.literal("")),
  title: z.string().trim().optional().or(z.literal("")),
};

const optStr = z.string().trim().optional().or(z.literal(""));

export const caseStudyReadoutsSchema = z
  .array(
    z.object({
      label: z.string().trim().min(1, "Readout label is required"),
      value: z.string().trim().min(1, "Readout value is required"),
    }),
  )
  .default([]);

export const caseStudySectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("challenge"),
    data: z.object({
      ...sectionBase,
      intro: prose.optional(),
      items: z
        .array(
          z.object({
            title: z.string().trim().min(1, "Item title is required"),
            body: prose.optional(),
          }),
        )
        .default([]),
    }),
  }),
  z.object({
    type: z.literal("journey"),
    data: z.object({
      ...sectionBase,
      lede: prose.optional(),
      nodes: z
        .array(
          z.object({
            status: z.enum(["dead-end", "breakthrough", "milestone"]),
            title: z.string().trim().min(1, "Node title is required"),
            body: prose.optional(),
          }),
        )
        .default([]),
      diagram: mediaId,
      architecture: z
        .object({
          before: z
            .object({
              heading: optStr,
              from: optStr,
              to: optStr,
              via: optStr,
              blocked: optStr,
            })
            .optional(),
          after: z
            .object({
              heading: optStr,
              from: optStr,
              to: optStr,
              flows: z.array(z.string().trim()).default([]),
            })
            .optional(),
          caption: prose.optional(),
        })
        .optional(),
    }),
  }),
  z.object({
    type: z.literal("solution"),
    data: z.object({
      ...sectionBase,
      lede: prose.optional(),
      cards: z
        .array(
          z.object({
            title: z.string().trim().min(1, "Card title is required"),
            body: prose.optional(),
            tags: z.array(z.string().trim()).default([]),
          }),
        )
        .default([]),
    }),
  }),
  z.object({
    type: z.literal("evolution"),
    data: z.object({
      ...sectionBase,
      lede: prose.optional(),
      rows: z
        .array(
          z.object({
            before: mediaId,
            after: mediaId,
            beforeLabel: z.string().trim().optional().or(z.literal("")),
            afterLabel: z.string().trim().optional().or(z.literal("")),
            caption: prose.optional(),
          }),
        )
        .default([]),
      showcase: z
        .array(
          z.object({
            image: mediaId,
            label: optStr,
            body: prose.optional(),
          }),
        )
        .default([]),
    }),
  }),
  z.object({
    type: z.literal("results"),
    data: z.object({
      ...sectionBase,
      lede: prose.optional(),
      tiles: z
        .array(
          z.object({
            value: z.string().trim().min(1, "Tile value is required"),
            label: z.string().trim().min(1, "Tile label is required"),
            detail: z.string().trim().optional().or(z.literal("")),
          }),
        )
        .default([]),
    }),
  }),
  z.object({
    type: z.literal("conclusion"),
    data: z.object({
      ...sectionBase,
      lede: prose.optional(),
      body: prose.optional(),
      signoff: z.string().trim().optional().or(z.literal("")),
    }),
  }),
  z.object({
    type: z.literal("prose"),
    data: z.object({
      title: z.string().trim().optional().or(z.literal("")),
      body: prose.optional(),
    }),
  }),
]);

export const caseStudySectionsSchema = z.array(caseStudySectionSchema).default([]);

/* ---------------------------------------------------------------------------
 * Company history: intro + arrays of past office addresses and logos.
 * Authored as JSON in the admin (like Menu items / case-study sections).
 * ------------------------------------------------------------------------- */

const year = z.coerce.number().int().min(1900).max(2100).optional();

export const companyHistorySchema = z.object({
  intro: z.string().trim().max(2000).optional().or(z.literal("")),
  ...seo,
});

export const companyAddressesSchema = z
  .array(
    z.object({
      label: z.string().trim().min(1, "Address label is required"),
      lines: z.string().trim().optional().or(z.literal("")),
      city: z.string().trim().optional().or(z.literal("")),
      country: z.string().trim().optional().or(z.literal("")),
      type: z.enum(["main-office", "branch", "registered-office"]),
      status: z.enum([
        "open-current",
        "temporarily-closed",
        "permanently-closed",
      ]),
      fromYear: year,
      toYear: year,
      note: z.string().trim().optional().or(z.literal("")),
      order: z.coerce.number().int().optional(),
      hidden: z.coerce.boolean().optional(),
    }),
  )
  .default([]);

export const companyLogosSchema = z
  .array(
    z.object({
      image: z.string().trim().optional().or(z.literal("")),
      label: z.string().trim().optional().or(z.literal("")),
      fromYear: year,
      toYear: year,
      note: z.string().trim().optional().or(z.literal("")),
      order: z.coerce.number().int().optional(),
      hidden: z.coerce.boolean().optional(),
    }),
  )
  .default([]);

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
  clients: z.string().trim().optional().or(z.literal("")),
  editor: z.enum(["blocknote", "lexical"]).default("blocknote"),
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
