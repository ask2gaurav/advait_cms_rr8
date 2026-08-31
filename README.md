# cmsrr7 — Local-first Static CMS

A React Router 8 admin panel that manages content in a **local** MongoDB, plus a
one-command export + prerender step that produces a **100% static**, SEO-first
public website you can host anywhere for near-zero cost.

- **Admin** (`/admin/*`) — runs only on your machine via `npm run dev`. CRUD for
  Pages, Posts, Case Studies, Menus, Media, Users, Settings. BlockNote rich text.
- **Public site** — prerendered HTML for every page. No runtime server, no
  database. Deploy `build/client/` to Cloudflare Pages / Netlify / S3 / etc.

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [AGENTS.md](./AGENTS.md).

## Setup

```bash
npm install
npm run db:up                 # start local MongoDB (docker-compose.yml)

cp .env.example .env          # then edit SESSION_SECRET + SEED_ADMIN_* + SITE_URL
npm run seed                  # master user + Advait Solutions settings, nav, page stubs
npm run icons                 # PWA / favicon PNGs from public/brand/icon.svg
```

MongoDB runs in Docker via [docker-compose.yml](./docker-compose.yml) (container
`cms-mongo`, data in the `cms-mongo-data` volume). It's local-only — the public
site is static and has no database. `npm run db:down` stops it; `npm run db:reset`
stops **and wipes** the data.

> If you previously started MongoDB with a raw `docker run --name cms-mongo`,
> remove it once so Compose can take over the name/port:
> `docker rm -f cms-mongo`, then `npm run db:up && npm run seed && npm run export`.

`SEED_RESET=1 npm run seed` re-seeds site settings, menus and the default page
stubs from scratch (users / posts / case studies are never touched) — use it
after a rebrand.

## Authoring

```bash
npm run dev                   # http://localhost:5173  → /admin
```

Sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. Create content; set it to
`published` when ready. Uploads land in `public/uploads/` with metadata in Mongo.

Well-known page slugs drive fixed routes: `home` (template), `about`, `approach`,
`services`, `products`, `contact`. Any other published page is served at `/<slug>`.

## Publishing the static site

```bash
npm run publish:static        # check boundary → export Mongo→content/*.json → prerender
npx serve build/client        # optional local preview
```

Then upload **only** `build/client/` to your static host. Re-run whenever content
changes.

| Command | What it does |
|---|---|
| `npm run db:up` / `db:down` | Start / stop local MongoDB (Docker) |
| `npm run db:shell` | `mongosh` into the `cms` database |
| `npm run db:reset` | Stop MongoDB **and delete all data** |
| `npm run dev` | Admin + public, with the dev server (Mongo required) |
| `npm run seed` | Idempotent: master user + settings + menus |
| `npm run export` | `content/*.json` snapshot of published content |
| `npm run build` | Prerender the public site (admin excluded) |
| `npm run publish:static` | boundary check + export + build |
| `npm run typecheck` | `react-router typegen && tsc` |
| `npm run check:boundary` | Fails if a public route imports server-only code |
| `npm run icons` | Regenerate PWA / favicon PNGs from the brand mark |

## Design system & brand

The public site is the **Advait Solutions** marketing site and the reusable base
layout for every page.

- Brand tokens (`brand-*`, `ink`, `charcoal`, `mist`) live in `app/app.css`.
  Orange (`#F97316`) is for CTAs and small accents only.
- Default marketing copy is typed structured data in `app/lib/site-content.ts`
  (not JSX). The CMS overrides it later; sections carry `data-cms-section`
  markers. Featured Work + Insights already render live CMS content.
- Design-system components: `app/components/{layout,ui,visuals,home}/*` and
  `app/components/site.tsx`. Imagery is generated SVG/CSS only — no external
  images.
- Dark mode is class-based with a no-flash script in `app/root.tsx` and a
  `ThemeToggle`.

## PWA

`public/manifest.webmanifest` + `public/service-worker.js` (registered in
production only) + `public/icons/*` + iOS meta in `app/root.tsx`. The SW does
stale-while-revalidate for assets and falls back to `/offline` for navigations.

**Update the logo:** replace `public/brand/icon.svg` (or drop
`public/brand/source-logo.png`) and `public/brand/logo.svg`, then run
`npm run icons`.

## Rules

- Never deploy the admin or a Mongo connection. Public host gets `build/client/` only.
- Public routes read **only** from `content/*.json` (enforced by `check:boundary`).
- Secrets live in `.env` (gitignored); `content/*.json` and `public/uploads/*` are
  generated and gitignored.
