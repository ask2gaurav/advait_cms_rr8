import { existsSync, readFileSync } from "node:fs";
import type { ContentMeta } from "~/lib/types";

/** Read the last content-export metadata, or null if the site was never exported. */
export function readContentMeta(): ContentMeta | null {
  if (!existsSync("content/.meta.json")) return null;
  try {
    return JSON.parse(readFileSync("content/.meta.json", "utf8")) as ContentMeta;
  } catch {
    return null;
  }
}
