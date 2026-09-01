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

- **User** — Admin accounts. `role: master | admin`; the master account is seeded and cannot be the last one removed.
- **Page** — Home, About, Approach, Contact, custom pages (template-driven).
- **Post** — Blog / Insights articles.
- **CaseStudy** — Works / Case Studies. Supports structured long-form `sections` (challenge / journey / solution / evolution / results / conclusion / prose) plus hero `readouts`; falls back to the rich-text `body` when no sections are set.
- **Menu** + **MenuItem** — Hierarchical navigation.
- **Media** — Uploaded assets metadata.
- **Setting** — Site-wide config (title, logo, social links, SEO defaults, etc.).

## Rendering Strategy (React Router 8)

> **Implementation note (2026-08-29):** `ssr` is kept **`true`**, not `false`.
> React Router 8 rejects server `loader`/`action` exports on any non-prerendered
> route when `ssr:false` (it aborts `react-router dev` too), which is
> incompatible with a server-rendered local admin in the same app. With
> `ssr:true` + a full `prerender()` list the public output is still 100% static
> — every public path is prerendered to HTML and only `build/client/` is
> deployed. The admin is excluded from the production build via `EXCLUDE_ADMIN=1`
> (wired into `npm run build`).

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true, // admin needs server loaders in dev; public output is prerendered
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

## Public site — design system & PWA (Advait Solutions base template)

The public site doubles as the Advait Solutions marketing site and the base
layout every page extends.

- **Layout:** `app/routes/public.tsx` (skip link, `SiteHeader`, `<main>`,
  `SiteFooter`). Header is sticky with a scroll shadow, a `ThemeToggle`, a
  "Start a Project" CTA and an accessible mobile slide-over (`MobileNav`).
- **Design system:** `app/components/layout/` (`Section`, `SectionHeading`),
  `app/components/ui/` (`button`, `CTALink`, `Badge`), `app/components/visuals/`
  (`NeuralMesh`, `GradientField`, `GridMotif`, `CodeGlyph` — inline SVG/CSS,
  no external images), `app/components/Icon.tsx` (named lucide icons),
  `app/components/site.tsx` (`Container`, `Prose`, `PageHero`, `JsonLd`).
- **Home sections:** `app/components/home/*` — `Hero`, `TrustBar`,
  `ServicesSnapshot`, `WhyAdvait`, `FeaturedWork`, `AiCapabilities`, `FinalCta`,
  rendered in that order by `app/routes/home.tsx`.
- **CMS-injection points:** default copy is typed data in
  `app/lib/site-content.ts`; each section root carries `data-cms-section`
  (`hero`, `services`, `why`, `featured-work`, `ai-capabilities`, `final-cta`,
  `header`, `footer`, `page-services`, `page-products`, `page-about`,
  `page-approach`). Featured Work and Insights read live `content/*.json`.
- **Theme:** class-based dark mode (`.dark` on `<html>`), seeded from system by
  a no-flash inline script in `app/root.tsx`; brand tokens in `app/app.css`.
- **PWA:** `public/manifest.webmanifest`, `public/service-worker.js`
  (SWR for assets, network-first + `/offline` fallback for navigations;
  registered in production only), `public/icons/*` (regenerated by
  `npm run icons` from `public/brand/icon.svg`), iOS meta in `app/root.tsx`.
- **SEO:** `app/lib/seo.ts` — `buildMeta()` (title/description/OG/Twitter/
  canonical/locale) plus Organization / Service / Article / BreadcrumbList
  JSON-LD. `Setting` gained a `tagline` field.

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

Last updated: 2026-08-30 (v1 CMS + Advait Solutions home page / public-site redesign + PWA)
