# Initial Kanban Task List

Use these cards as the starting backlog in Cline Kanban.  
Copy the title + description into each card. Link dependent cards where indicated.

**Legend**
- `[FOUNDATION]` — must finish before most other work
- `[PARALLEL]` — can run in parallel after foundation
- `[SEQ]` — depends on previous card(s)

---

## Foundation Track (run first, mostly sequential)

### 1. [FOUNDATION] Project scaffold & tooling
**Title:** Scaffold React Router 7 + TypeScript + Tailwind + basic config  
**Description:**
- Create React Router 7 project (framework mode).
- Add TypeScript (strict), Tailwind CSS, PostCSS, shadcn/ui base.
- Add `.env.example`, proper `.gitignore`, ESLint + Prettier (or Biome).
- Add scripts: `dev`, `build`, `typecheck`, `export` (placeholder).
- Commit initial structure matching ARCHITECTURE.md.
- Do **not** implement admin or Mongo yet.

**Acceptance:** `npm run dev` starts, basic Tailwind works, typecheck passes.

---

### 2. [FOUNDATION][SEQ] MongoDB connection + base models
**Title:** Add MongoDB + Mongoose models (Page, Post, CaseStudy, Media, Menu, Setting)  
**Description:**
- Add Mongoose (or agreed ODM).
- Create `app/lib/db.server.ts` (server-only connection).
- Implement models exactly as defined in MONGODB_SCHEMA.md.
- Add TypeScript interfaces.
- Create a simple seed script that inserts one Setting document and a couple of sample records.
- Ensure connection only runs on server / admin side.

**Depends on:** Task 1  
**Acceptance:** Can connect to local MongoDB, models compile, seed works.

---

### 3. [FOUNDATION][SEQ] Admin layout + local auth guard
**Title:** Create /admin layout with simple local authentication  
**Description:**
- Add `app/routes/admin/_layout.tsx` and basic dashboard (`admin/_index.tsx`).
- Implement simple local auth (session cookie or basic username/password from env).
- Protect all `/admin/*` routes.
- Style with shadcn/ui (sidebar + top bar skeleton).
- Make sure admin routes are excluded from public prerender later.

**Depends on:** Task 1  
**Acceptance:** Visiting `/admin` requires login; after login shows dashboard shell.

---

### 4. [FOUNDATION][SEQ] Content export script
**Title:** Implement `npm run export` — Mongo → content/*.json  
**Description:**
- Create `scripts/export-content.ts`.
- Query all published Pages, Posts, CaseStudies, Menus, Settings.
- Resolve Media ObjectIds to public paths.
- Write clean JSON files into `/content`.
- Add the script to package.json.
- Document usage in README.

**Depends on:** Task 2  
**Acceptance:** Running export produces valid JSON snapshots that public loaders can consume.

---

## Parallel Tracks (start after Foundation tasks 1–3 are merged)

### 5. [PARALLEL] Menu management (Admin)
**Title:** Admin CRUD for Menus + hierarchical MenuItems  
**Description:**
- Routes under `admin/menus`.
- List, create, edit, delete menus.
- Nested menu item editor (drag-and-drop optional for v1).
- Support types: page, post, caseStudy, custom, external.
- Save to MongoDB.

**Depends on:** Tasks 2 + 3  
**Owns:** `app/routes/admin/menus.*`, related components

---

### 6. [PARALLEL] Pages CRUD (Admin)
**Title:** Admin CRUD for Pages  
**Description:**
- Routes under `admin/pages`.
- List (with status filter), create, edit, delete.
- Fields: title, slug, status, template, SEO fields, body (placeholder textarea for now), publishedAt.
- Auto-generate slug from title (editable).
- Validation with Zod.

**Depends on:** Tasks 2 + 3  
**Owns:** `app/routes/admin/pages.*`

---

### 7. [PARALLEL] Posts / Blog CRUD (Admin)
**Title:** Admin CRUD for Posts (Blog / Insights)  
**Description:**
- Routes under `admin/posts`.
- Full CRUD + status, tags, categories, cover image reference, SEO.
- Body as textarea placeholder (rich text comes later).
- List view with filters (status, tag).

**Depends on:** Tasks 2 + 3  
**Owns:** `app/routes/admin/posts.*`

---

### 8. [PARALLEL] Case Studies CRUD (Admin)
**Title:** Admin CRUD for Case Studies / Works  
**Description:**
- Routes under `admin/case-studies`.
- Fields per MONGODB_SCHEMA.md (client, industry, services, gallery, etc.).
- Full CRUD + featured flag + ordering.

**Depends on:** Tasks 2 + 3  
**Owns:** `app/routes/admin/case-studies.*`

---

### 9. [PARALLEL] Media library (Admin)
**Title:** Media upload + library UI  
**Description:**
- Upload endpoint / action that writes files to `public/uploads/` (organized by year/month).
- Store metadata in Media collection.
- Admin media library: grid/list, search, delete, edit alt text.
- Return public path after upload so other forms can reference it.

**Depends on:** Tasks 2 + 3  
**Owns:** `app/routes/admin/media.*`, upload helpers

---

### 10. [PARALLEL] Rich text editor integration
**Title:** Integrate BlockNote (or Tiptap) into Page / Post / CaseStudy forms  
**Description:**
- Install BlockNote (free open-source).
- Replace body textarea with the editor.
- Persist editor JSON to MongoDB.
- Create a shared `<RichTextEditor>` component for admin.
- Create a public `<RichTextRenderer>` that safely turns the JSON into React elements / HTML.
- Basic toolbar (headings, lists, links, images if easy).

**Depends on:** Tasks 6, 7, 8 (or can start after 3 and wire later)  
**Owns:** editor components + integration points in the three forms

---

### 11. [PARALLEL] Public site layouts + core pages
**Title:** Public layout, Home, About, Approach, Contact, Services, Products  
**Description:**
- Root layout with header (driven by Menu) + footer.
- Static or data-driven pages for the main sections listed in the original brief.
- Use exported JSON where content is dynamic.
- Basic responsive design with Tailwind + shadcn.

**Depends on:** Task 4 (export) + Task 5 (menus)  
**Owns:** public route files + layout components

---

### 12. [PARALLEL] Blog public pages
**Title:** Public blog index + post detail (SSG ready)  
**Description:**
- `/blog` index (list of published posts).
- `/blog/$slug` detail page.
- Load data only from `content/posts.json`.
- SEO meta, Open Graph, reading time if available.
- Prepare for prerender paths.

**Depends on:** Task 4 + Task 7  
**Owns:** `app/routes/blog.*`

---

### 13. [PARALLEL] Case Studies public pages
**Title:** Public works index + case study detail  
**Description:**
- `/works` index.
- `/works/$slug` detail.
- Gallery support, project meta.
- Data only from exported JSON.

**Depends on:** Task 4 + Task 8  
**Owns:** `app/routes/works.*`

---

### 14. [PARALLEL] React Router prerender configuration
**Title:** Configure static prerender for all public URLs  
**Description:**
- Implement `prerender()` in `react-router.config.ts` that discovers all published paths from content JSON.
- Ensure admin routes are never prerendered.
- Verify build output contains HTML for every public page.
- Add sitemap.xml + robots.txt generation.

**Depends on:** Tasks 4, 11, 12, 13  
**Owns:** `react-router.config.ts`, build scripts, sitemap

---

### 15. [PARALLEL] Third-party integrations
**Title:** Comments (Giscus), Calendar embed, Contact form  
**Description:**
- Giscus (or Utterances) on blog posts — SEO friendly, static.
- Cal.com (or similar) embed on Contact / Approach page.
- Contact form that posts to Formspree / Resend / Netlify Forms (no custom backend).
- Make all integrations optional via Settings.

**Depends on:** Task 11 (public layout)  
**Owns:** integration components + settings fields

---

### 16. [PARALLEL] SEO helpers & polish
**Title:** Shared SEO component, structured data, Open Graph, performance basics  
**Description:**
- Reusable `<Seo>` component used by all public pages.
- JSON-LD for articles and organization.
- Basic image optimization guidance / helper.
- Lighthouse-friendly defaults.

**Depends on:** Tasks 11–13  
**Owns:** `app/lib/seo.ts` + usage across public routes

---

## Suggested Execution Order in Kanban

1. Start **Task 1** alone.
2. After Task 1 is merged → start **Task 2** and **Task 3** in parallel (different worktrees).
3. After Task 2 → start **Task 4**.
4. Once Tasks 2 + 3 are done → fan out Tasks 5–9 in parallel.
5. Task 10 (editor) can start as soon as any of the content forms exist.
6. Public-facing tasks (11–16) start after export (Task 4) is reliable.

Use Kanban **task linking** so that when a foundation card is completed and trashed, the next dependent cards auto-start if you want autonomous flow.

---

## Card Template (copy-paste into Kanban)

```
Title: <from list above>

Description:
<paste the Description>

Scope / Owns:
<list the files or folders this agent is allowed to touch>

Depends on:
<task numbers>

Acceptance criteria:
<from list>
```

---

Last updated: 2026-08-29
