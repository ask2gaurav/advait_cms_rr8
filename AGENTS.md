# AGENTS.md — Rules for AI Coding Agents

This file is the single source of truth for every AI coding agent (Cline, Claude Code, Codex, gemini pro,  DeepSeek, etc.) working on this repository.
Read it completely before starting any task.

## Project Goal (one sentence)

Build a local-first React Router 8 CMS that stores content in MongoDB, provides a rich admin UI, and generates a fully static SEO-friendly website that can be hosted on any static host at near-zero cost.

## Non-Negotiable Rules

1. **Never deploy the admin panel or MongoDB connection to production.**  
   The public site must be pure static files. Admin runs only on localhost.

2. **Public routes must never import or call MongoDB at runtime.**  
   They may only read from the exported JSON snapshots in `/content`.

3. **All new code must be TypeScript.**  
   Prefer strict types. Share types between admin models and public loaders when possible.

4. **Follow the directory structure defined in ARCHITECTURE.md.**  
   Do not invent new top-level folders without updating ARCHITECTURE.md.

5. **Do not modify files outside the scope of your assigned task.**  
   If a task says “own `app/routes/admin/posts.*`”, stay inside that boundary unless explicitly told otherwise.

6. **Prefer existing libraries already chosen in ARCHITECTURE.md.**  
   - Styling: Tailwind + shadcn/ui  
   - Rich text: BlockNote (primary)  
   - Database: Mongoose (or the agreed ODM)  
   Do not introduce competing libraries (e.g. another CSS framework, another editor) without discussion.

7. **Keep changes small and reviewable.**  
   One logical feature per branch / worktree. Prefer many small PRs over one giant PR.

8. **Update documentation when you change architecture or conventions.**  
   If you alter data models, rendering strategy, or folder layout, update ARCHITECTURE.md in the same change.

9. **Secrets never go in the repo.**  
   Use `.env` (gitignored). Provide `.env.example` with placeholder values.

10. **Write clear conventional commit messages.**  
    Example: `feat(admin): add BlockNote editor to post form`

## Coding Conventions

### File Naming
- React Router routes: follow file-based routing conventions (`$slug.tsx`, `_index.tsx`, `_layout.tsx`).
- Components: PascalCase (`PostEditor.tsx`).
- Utilities / models: camelCase or kebab-case as already used in the project.
- Server-only modules: suffix with `.server.ts`.

### Data Access
- Admin side: use Mongoose models from `app/lib/models/`.
- Public side / build: read only from `content/*.json`.
- Never put MongoDB connection code in client-side bundles.

### Rich Text
- Store editor output as JSON (BlockNote / Tiptap format).
- Provide a safe renderer component that converts the JSON to React elements / HTML.
- Sanitize on both save and render.

### UI
- Use shadcn/ui components wherever possible.
- Keep admin UI functional and clean; public UI should be polished and accessible.
- Mobile-first Tailwind.

### Testing & Quality
- After significant changes, run type-check and lint.
- Prefer pure functions for data transformation so they are easy to unit-test later.

## How to Work with Cline Kanban / Parallel Agents

- Each Kanban card runs in its own **git worktree**. You are isolated from other agents.
- Stay inside the files/directories listed in your task description.
- When you finish, leave a short summary of what you did and any follow-up needed.
- If you discover a blocking dependency on another agent’s work, stop and report it instead of working around it by editing shared files.
- Do not force-push or rewrite history on shared branches.

## Definition of Done (for every task)

- [ ] Code compiles and type-checks
- [ ] No new lint errors introduced
- [ ] Changes stay within the assigned scope
- [ ] ARCHITECTURE.md / AGENTS.md updated if needed
- [ ] Commit message follows conventional commits
- [ ] Brief summary left for the human reviewer

## Useful Commands (reference)

```bash
# Install
npm install

# Local MongoDB (example with Docker)
docker run -d -p 27017:27017 --name cms-mongo mongo:7

# Export content for static build
npm run export

# Development (admin + public)
npm run dev

# Production static build
npm run build

# Type check
npm run typecheck
```

## Public site — Advait Solutions base template

The public site is the Advait Solutions marketing site and the base layout for every page.

- **Brand:** primary orange `#F97316` (`brand-*` tokens in `app/app.css`), charcoal `#1F2937` / ink `#111827`, `mist` surface. **Use orange sparingly** — CTAs and small accents only. Inter font. Rounded `lg`/`xl`, soft shadows, subtle borders, generous whitespace.
- **Imagery:** generated abstract SVG/CSS only (`app/components/visuals/*`). **No external images / Unsplash / hotlinks** — CSP, offline and local-first forbid it. Real photos, if ever added, go in `public/` and use `<img>` with `width`/`height` + `loading="lazy"`.
- **Design system:** `app/components/layout/{Section,SectionHeading}`, `app/components/ui/{button,CTALink,Badge}`, `app/components/Icon` (named lucide icons), `app/components/site` (`Container`, `SiteHeader`, `SiteFooter`, `Prose`, `PageHero`, `JsonLd`). Home sections live in `app/components/home/*`.
- **Default copy** is typed structured data in `app/lib/site-content.ts` (never JSX). The CMS overrides it later; sections are marked with `data-cms-section` (`hero`, `services`, `why`, `featured-work`, `ai-capabilities`, `final-cta`, `header`, `footer`, `page-*`). Featured Work + Insights already read live CMS data.
- **Dark mode:** class-based (`.dark` on `<html>`), seeded from system by the no-flash script in `app/root.tsx`; `ThemeToggle` persists an explicit choice. Every new component must be correct in both themes.
- **PWA:** `public/manifest.webmanifest`, `public/service-worker.js` (minimal SWR + offline fallback → `/offline`), icons in `public/icons/`. Regenerate icons after changing the logo: replace `public/brand/icon.svg` (or add `public/brand/source-logo.png`) then run `npm run icons`.
- **SEO:** every route exports `meta` via `buildMeta()` in `app/lib/seo.ts`; JSON-LD helpers for Organization / Service / Article / BreadcrumbList.

## When in Doubt

1. Re-read ARCHITECTURE.md.
2. Prefer the simplest solution that satisfies the requirements.
3. Ask the human (via Kanban comment or PR description) rather than inventing a new pattern.

---

Last updated: 2026-08-30
