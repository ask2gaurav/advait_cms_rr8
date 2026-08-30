import slugify from "slugify";

/** URL-safe slug from arbitrary text. Pure — safe on client and server. */
export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}
