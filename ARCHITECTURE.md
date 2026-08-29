# Architecture — React Router 8 Static CMS

## Vision

A local-first CMS with a React Router 8 admin panel that manages content in MongoDB.
The admin runs only on the developer’s machine. On demand it exports content and
generates a fully static, SEO-friendly website that is uploaded to any static host
(Cloudflare Pages, Netlify, S3 + CDN, etc.). Zero runtime server cost for the public site.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  LOCAL MACHINE (Developer)                                      │
│                                                                 │
│  ┌──────────────────────┐      ┌────────────────────────────┐  │
│  │ Admin Panel          │─────▶│ MongoDB (local / Docker)   │  │
│  │ React Router 8       │      │ content, media metadata    │  │
│  │ /admin/*             │      └────────────────────────────┘  │
│  │ CRUD + Rich Text     │                 │                    │
│  │ Media upload         │                 │                    │
│  └──────────────────────┘                 │                    │
│           │                               ▼                    │
│           │                    ┌────────────────────────────┐  │
│           │                    │ Export Script              │  │
│           │                    │ Mongo → JSON / MDX snapshots│  │
│           │                    └────────────────────────────┘  │
│           │                               │                    │
│           ▼                               ▼                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ React Router 8 Build (prerender)                         │  │
│  │ Loaders read exported data → generate static HTML + .data│  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│               build/client/  (static output)                    │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │  rsync / git push / CLI upload
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PRODUCTION (Static Host only)                                  │
│  Cloudflare Pages / Netlify / Vercel / S3 + CloudFront          │
│  Pure HTML + CSS + JS + images                                  │
│  Perfect SEO, near-zero cost                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Core Principles

1. **Admin is local-only** — never deploy the admin panel or MongoDB connection to production.
2. **Public site is 100% static** — no runtime database, no API calls for content.
3. **Build-time data snapshot** — MongoDB content is exported to JSON (or MDX) before / during the React Router prerender step.
4. **SEO first** — every public page is pre-rendered HTML with proper meta, Open Graph, structured data, sitemap, and robots.txt.
5. **Type-safe** — TypeScript end-to-end. Shared types between admin models and public loaders.
6. **Media is filesystem + metadata** — files live in `public/uploads` (or `content/media`); MongoDB stores path, alt, dimensions, etc.

## Tech Stack

| Layer              | Choice                                      | Notes |
|--------------------|---------------------------------------------|-------|
| Framework          | React Router 8 (Framework mode)             | File-based routing, loaders, prerender |
| Language           | TypeScript                                  | Strict mode |
| Styling            | Tailwind CSS + shadcn/ui                    | Consistent design system |
| Database           | MongoDB (local Community Edition or Docker) | Admin only |
| ODM                | Mongoose or native MongoDB driver + Zod     | Prefer Mongoose for schema validation |
| Rich Text          | BlockNote (primary) / Tiptap / Lexical      | Free & open-source; store as JSON |
| Auth (Admin)       | Simple local session / basic auth           | No external provider required |
| Forms (Contact)    | Formspree / Resend / static form handler    | Third-party, SEO friendly |
| Comments           | Giscus or Utterances                        | GitHub-based, static-friendly |
| Calendar           | Cal.com embed                               | Static embed |
| Build              | React Router prerender + custom export script | |
| Hosting (Public)   | Any static host                             | |

## Directory Structure

```
/
├── app/
│   ├── routes/
│   │   ├── admin/                 # Admin panel routes (local only)
│   │   │   ├── _layout.tsx
│   │   │   ├── _index.tsx         # Dashboard
│   │   │   ├── pages.*
│   │   │   ├── posts.*            # Blog / Insights
│   │   │   ├── case-studies.*
│   │   │   ├── menus.*
│   │   │   ├── media.*
│   │   │   └── settings.*
│   │   ├── _index.tsx             # Public Home
│   │   ├── services.tsx
│   │   ├── products.tsx
│   │   ├── works._index.tsx
│   │   ├── works.$slug.tsx
│   │   ├── about.tsx
│   │   ├── approach.tsx
│   │   ├── blog._index.tsx
│   │   ├── blog.$slug.tsx
│   │   ├── contact.tsx
│   │   └── ...
│   ├── components/                # Shared + public UI
│   ├── admin/                     # Admin-specific components
│   ├── lib/
│   │   ├── db.server.ts           # Mongo connection (server-only)
│   │   ├── models/                # Mongoose models
│   │   ├── export.server.ts       # Mongo → JSON export
│   │   └── seo.ts
│   └── root.tsx
├── content/                       # Build-time snapshots (generated)
│   ├── pages.json
│   ├── posts.json
│   ├── case-studies.json
│   ├── menus.json
│   └── settings.json
├── public/
│   ├── uploads/                   # User-uploaded media
│   └── ...
├── scripts/
│   ├── export-content.ts          # Mongo → content/*.json
│   └── build-static.ts            # optional orchestration
├── react-router.config.ts         # prerender paths
├── ARCHITECTURE.md
├── AGENTS.md
└── package.json
```

## Data Flow

### Content Creation / Editing
1. Developer opens `/admin` locally.
2. Authenticates (simple local auth).
3. Creates / edits Pages, Posts, Case Studies, Menus, Media, Settings.
4. Rich text is stored as BlockNote/Tiptap JSON in MongoDB.
5. Media files are written to `public/uploads/` and metadata saved in MongoDB.

### Static Site Generation
1. Run `npm run export` → `scripts/export-content.ts` dumps all published content to `content/*.json`.
2. Run `npm run build` → React Router executes loaders that read the JSON snapshots and pre-renders every public URL.
3. Output lands in `build/client/` (HTML + assets + `.data` files for client navigations).
4. Upload only `build/client/` to the static host.

### Public Request
- Browser receives pre-rendered HTML (excellent TTFB and SEO).
- Client-side React hydrates for interactivity and subsequent navigations.

## Content Types (see MongoDB schema)

- **Page** — Home, About, Approach, Contact, custom pages (template-driven).
- **Post** — Blog / Insights articles.
- **CaseStudy** — Works / Case Studies.
- **Menu** + **MenuItem** — Hierarchical navigation.
- **Media** — Uploaded assets metadata.
- **Setting** — Site-wide config (title, logo, social links, SEO defaults, etc.).

## Rendering Strategy (React Router 8)

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false, // or true during local preview; production build uses prerender
  async prerender() {
    // Dynamically discover all public paths from content/*.json
    const pages = await import("./content/pages.json");
    const posts = await import("./content/posts.json");
    const cases = await import("./content/case-studies.json");
    // ...
    return [
      "/",
      "/about",
      "/approach",
      "/contact",
      "/services",
      "/products",
      "/works",
      "/blog",
      ...pages.map(p => `/${p.slug}`),
      ...posts.map(p => `/blog/${p.slug}`),
      ...cases.map(c => `/works/${c.slug}`),
    ];
  },
} satisfies Config;
```

Loaders on public routes must only read from the exported JSON (never from MongoDB at build time for the public site).

## Security Notes

- Admin routes must be unreachable in the production static build (or protected by build-time exclusion).
- MongoDB connection string and any secrets live only in local `.env` (never committed).
- Uploaded files should be validated (type, size) on the admin side.
- No user-generated content is executed; rich text is sanitized on render.

## Future Extensions (out of scope for v1)

- Multi-user admin with roles
- Draft / preview system with temporary tokens
- Incremental Static Regeneration style rebuilds
- i18n
- Search index generation (Pagefind / FlexSearch)

---

Last updated: 2026-08-29
