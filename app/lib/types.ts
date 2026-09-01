/**
 * Shared types used by both the admin (Mongoose models) and the public site
 * (loaders reading `content/*.json`).
 *
 * The `*Doc` types describe the raw MongoDB document shape.
 * The `*Public` types describe the denormalized, export-ready shape written to
 * `content/*.json` (Media ObjectIds resolved to paths, published-only, etc.).
 */

export type ContentStatus = "draft" | "published" | "archived";

/** BlockNote / rich-text editor document (stored + exported as-is). */
export type RichTextJSON = unknown;

export interface SeoFields {
  seoTitle?: string;
  seoDescription?: string;
  /** Resolved public path in the export, ObjectId string in the raw doc. */
  ogImage?: string;
}

export interface MediaPublic {
  id: string;
  path: string;
  mimeType: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
}

export interface PagePublic extends SeoFields {
  title: string;
  slug: string;
  template: string;
  excerpt?: string;
  body: RichTextJSON;
  bodyHtml: string;
  order?: number;
  publishedAt?: string;
  updatedAt: string;
}

export interface PostPublic extends SeoFields {
  title: string;
  slug: string;
  excerpt?: string;
  body: RichTextJSON;
  bodyHtml: string;
  coverImage?: MediaPublic;
  tags: string[];
  categories: string[];
  author?: string;
  readingTime?: number;
  featured?: boolean;
  publishedAt?: string;
  updatedAt: string;
}

/** Hero stat chip. Plain text — rendered as React nodes, never HTML. */
export interface CaseStudyReadout {
  label: string;
  value: string;
}

/**
 * Structured case-study section blocks. The `*Html` fields are sanitized HTML
 * produced from plain author prose at export time; media ids are resolved to
 * `MediaPublic` (dropped when unresolved).
 */
export type CaseStudySectionPublic =
  | {
      type: "challenge";
      data: {
        kicker?: string;
        title?: string;
        introHtml?: string;
        items: { title: string; bodyHtml?: string }[];
      };
    }
  | {
      type: "journey";
      data: {
        kicker?: string;
        title?: string;
        ledeHtml?: string;
        nodes: {
          status: "dead-end" | "breakthrough" | "milestone";
          title: string;
          bodyHtml?: string;
        }[];
        diagram?: MediaPublic;
      };
    }
  | {
      type: "solution";
      data: {
        kicker?: string;
        title?: string;
        ledeHtml?: string;
        cards: { title: string; bodyHtml?: string; tags: string[] }[];
      };
    }
  | {
      type: "evolution";
      data: {
        kicker?: string;
        title?: string;
        ledeHtml?: string;
        rows: {
          before?: MediaPublic;
          after?: MediaPublic;
          beforeLabel?: string;
          afterLabel?: string;
          captionHtml?: string;
        }[];
      };
    }
  | {
      type: "results";
      data: {
        kicker?: string;
        title?: string;
        ledeHtml?: string;
        tiles: { value: string; label: string; detail?: string }[];
      };
    }
  | {
      type: "conclusion";
      data: {
        kicker?: string;
        title?: string;
        ledeHtml?: string;
        bodyHtml?: string;
        signoff?: string;
      };
    }
  | {
      type: "prose";
      data: { title?: string; bodyHtml?: string };
    };

export interface CaseStudyPublic extends SeoFields {
  title: string;
  slug: string;
  excerpt?: string;
  body: RichTextJSON;
  bodyHtml: string;
  coverImage?: MediaPublic;
  gallery: MediaPublic[];
  client?: string;
  industry?: string;
  services: string[];
  year?: number;
  url?: string;
  featured?: boolean;
  order?: number;
  readouts: CaseStudyReadout[];
  sections: CaseStudySectionPublic[];
  publishedAt?: string;
  updatedAt: string;
}

export interface MenuItemPublic {
  label: string;
  url: string;
  target: "_self" | "_blank";
  children: MenuItemPublic[];
}

export interface MenuPublic {
  name: string;
  location: string;
  items: MenuItemPublic[];
}

export interface SettingsPublic {
  siteName: string;
  siteUrl: string;
  tagline?: string;
  logo?: MediaPublic;
  favicon?: MediaPublic;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  defaultOgImage?: MediaPublic;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    [key: string]: string | undefined;
  };
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  /** Optional third-party integration config (Giscus, Cal.com, contact form). */
  integrations?: {
    giscus?: Record<string, string>;
    calcom?: { url?: string };
    contactForm?: { provider?: string; endpoint?: string };
  };
  extras?: Record<string, unknown>;
}

export interface ContentMeta {
  exportedAt: string;
  counts: Record<string, number>;
}
