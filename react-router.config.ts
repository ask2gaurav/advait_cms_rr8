import type { Config } from "@react-router/dev/config";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

function readContent<T>(name: string): T[] {
  const path = fileURLToPath(new URL(`./content/${name}`, import.meta.url));
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T[];
  } catch {
    return [];
  }
}

const RESERVED = new Set([
  "home",
  "about",
  "approach",
  "contact",
  "services",
  "products",
]);

export default {
  // SSR stays on so the local admin (server loaders/actions) works under
  // `react-router dev`. The public site is still shipped as pure static files:
  // every public path is prerendered below and only `build/client/` is deployed.
  ssr: true,

  async prerender() {
    const pages = readContent<{ slug: string }>("pages.json");
    const posts = readContent<{ slug: string }>("posts.json");
    const cases = readContent<{ slug: string }>("case-studies.json");

    return [
      "/",
      "/about",
      "/approach",
      "/services",
      "/products",
      "/contact",
      "/works",
      "/blog",
      "/offline",
      "/sitemap.xml",
      "/robots.txt",
      ...pages
        .filter((p) => !RESERVED.has(p.slug))
        .map((p) => `/${p.slug}`),
      ...posts.map((p) => `/blog/${p.slug}`),
      ...cases.map((c) => `/works/${c.slug}`),
    ];
  },
} satisfies Config;
