# MongoDB Schema — React Router 7 CMS

All collections live in a single database (suggested name: `cms`).

Use Mongoose (or the equivalent ODM) with TypeScript interfaces that mirror these shapes.
Timestamps (`createdAt`, `updatedAt`) should be enabled on every model.

---

## 1. Setting (singleton-style)

Site-wide configuration. Usually only one document (or keyed by `key`).

```ts
{
  key: string;                    // e.g. "site"
  siteName: string;
  siteUrl: string;                // canonical production URL
  logo?: ObjectId;                // → Media
  favicon?: ObjectId;             // → Media
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  defaultOgImage?: ObjectId;      // → Media
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    // ...
  };
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  // free-form extras
  extras?: Record<string, unknown>;
}
```

---

## 2. Media

```ts
{
  filename: string;               // stored filename on disk
  originalName: string;
  path: string;                   // relative path e.g. /uploads/2026/08/image.webp
  mimeType: string;
  size: number;                   // bytes
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  uploadedBy?: string;            // optional user id / name
}
```

Files themselves live on the filesystem under `public/uploads/`.  
MongoDB only stores metadata.

---

## 3. Menu

```ts
{
  name: string;                   // e.g. "Main", "Footer"
  location: "header" | "footer" | "sidebar" | string;
  items: MenuItem[];              // embedded for simplicity (or separate collection)
  isActive: boolean;
}

type MenuItem = {
  label: string;
  type: "page" | "post" | "caseStudy" | "custom" | "external";
  // one of the following depending on type
  page?: ObjectId;                // → Page
  post?: ObjectId;                // → Post
  caseStudy?: ObjectId;           // → CaseStudy
  url?: string;                   // custom / external
  target?: "_self" | "_blank";
  children?: MenuItem[];          // nested menus
  order: number;
  isVisible: boolean;
};
```

---

## 4. Page

Flexible pages (Home, About, Approach, Contact, or any custom page).

```ts
{
  title: string;
  slug: string;                   // unique, URL-friendly
  status: "draft" | "published" | "archived";
  template: "default" | "home" | "about" | "contact" | "landing" | string;
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: ObjectId;             // → Media
  // Content
  excerpt?: string;
  body: unknown;                  // BlockNote / Tiptap JSON
  // Optional structured sections (for page builders later)
  sections?: Array<{
    type: string;
    data: Record<string, unknown>;
  }>;
  // Ordering / visibility
  order?: number;
  publishedAt?: Date;
}
```

---

## 5. Post (Blog / Insights)

```ts
{
  title: string;
  slug: string;                   // unique
  status: "draft" | "published" | "archived";
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  // Content
  excerpt?: string;
  body: unknown;                  // BlockNote / Tiptap JSON
  coverImage?: ObjectId;          // → Media
  // Taxonomy
  tags: string[];
  categories: string[];
  // Meta
  author?: string;
  readingTime?: number;           // minutes (can be computed)
  publishedAt?: Date;
  featured?: boolean;
}
```

---

## 6. CaseStudy (Works)

```ts
{
  title: string;
  slug: string;                   // unique
  status: "draft" | "published" | "archived";
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  // Content
  heroEyebrow?: string;           // small label above the hero title ("Case Study — X")
  excerpt?: string;
  body: unknown;                  // BlockNote / Tiptap JSON
  coverImage?: ObjectId;          // → Media
  gallery?: ObjectId[];           // → Media[]
  // Project details
  client?: string;
  industry?: string;
  services: string[];             // or ObjectId[] later
  year?: number;
  url?: string;                   // live project link
  // Structured long-form content (rendered by /works/:slug when present;
  // falls back to `body` when `sections` is empty). Authored as JSON in admin.
  readouts?: Array<{ label: string; value: string }>;   // hero stat chips
  sections?: Array<{
    type:
      | "challenge"
      | "journey"
      | "solution"
      | "evolution"
      | "results"
      | "conclusion"
      | "prose";
    data: Record<string, unknown>;  // prose fields are plain strings,
                                    // media fields are Media ObjectId strings.
                                    // data.label → eyebrow suffix ("01 — The Challenge");
                                    // journey.architecture → before/after diagram;
                                    // evolution.showcase → "new in production" items
  }>;
  // Meta
  featured?: boolean;
  order?: number;
  publishedAt?: Date;
}
```

---

## Indexes (recommended)

```js
// Page
{ slug: 1 } unique
{ status: 1, publishedAt: -1 }

// Post
{ slug: 1 } unique
{ status: 1, publishedAt: -1 }
{ tags: 1 }
{ categories: 1 }

// CaseStudy
{ slug: 1 } unique
{ status: 1, publishedAt: -1 }
{ featured: 1, order: 1 }

// Media
{ path: 1 } unique

// Menu
{ location: 1, isActive: 1 }
```

---

## Relationships Summary

| From        | To          | Type          |
|-------------|-------------|---------------|
| Page        | Media       | ogImage       |
| Post        | Media       | coverImage    |
| CaseStudy   | Media       | coverImage, gallery |
| Setting     | Media       | logo, favicon, defaultOgImage |
| MenuItem    | Page/Post/CaseStudy | reference |

For v1 we keep relations simple (ObjectId references).  
Populate only on the admin side. Public site uses the exported JSON which already contains the resolved paths/URLs.

---

## Export Shape (content/*.json)

The export script should produce denormalized, public-ready JSON:

- Resolve all Media ObjectIds to public paths (`/uploads/...`).
- Include only `status: "published"` documents.
- Sort by `publishedAt` / `order` as needed.
- Keep the rich-text `body` as-is (JSON) so the public renderer can consume it.

Example `content/posts.json`:

```json
[
  {
    "title": "...",
    "slug": "...",
    "excerpt": "...",
    "body": { /* BlockNote JSON */ },
    "coverImage": "/uploads/2026/08/hero.webp",
    "tags": ["react", "cms"],
    "publishedAt": "2026-08-15T10:00:00.000Z",
    "seoTitle": "...",
    "seoDescription": "..."
  }
]
```

---

Last updated: 2026-08-29
