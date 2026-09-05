import { copyFile, mkdir, readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import mongoose from "mongoose";
import { imageSize } from "image-size";
import { connectDb } from "../app/lib/db.server";
import { User, hashPassword } from "../app/lib/models/user.server";
import { Setting } from "../app/lib/models/setting.server";
import { Menu } from "../app/lib/models/menu.server";
import { Page } from "../app/lib/models/page.server";
import { CaseStudy } from "../app/lib/models/case-study.server";
import { CompanyHistory } from "../app/lib/models/company-history.server";
import { Media } from "../app/lib/models/media.server";
import { siteContent } from "../app/lib/site-content";
import { toSlug } from "../app/lib/slug";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

/** Human-ish alt text from a file's base name. */
function altFromName(name: string): string {
  const stem = name.slice(0, name.length - extname(name).length);
  const words = stem.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Copy every image under `input_media/` into `public/uploads/seed/` and upsert a
 * Media doc for each (idempotent — keyed on the deterministic path). Returns a
 * map from original file name (e.g. `app_lock.png`) to the Media `_id`.
 */
async function seedMedia(): Promise<Map<string, mongoose.Types.ObjectId>> {
  const srcRoots = ["input_media", "input_pages"];
  const destDir = join("public", "uploads", "seed");
  await mkdir(destDir, { recursive: true });

  // Recursively collect files. Tolerant of a root that doesn't exist (e.g. an
  // input folder that was renamed) so seeding never hard-crashes on it.
  const files: string[] = [];
  async function walk(dir: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else files.push(full);
    }
  }
  for (const root of srcRoots) await walk(root);

  const map = new Map<string, mongoose.Types.ObjectId>();
  for (const src of files.sort()) {
    const ext = extname(src).toLowerCase();
    const mimeType = MIME_BY_EXT[ext];
    if (!mimeType) continue; // skip non-image files
    const originalName = basename(src);
    const filename = `${toSlug(basename(src, ext))}${ext}`;
    const relPath = `/uploads/seed/${filename}`;

    const buf = await readFile(src);
    await copyFile(src, join(destDir, filename));

    let width: number | undefined;
    let height: number | undefined;
    if (ext !== ".svg") {
      try {
        const dim = imageSize(buf);
        width = dim.width;
        height = dim.height;
      } catch {
        /* non-fatal */
      }
    }

    const doc = await Media.findOneAndUpdate(
      { path: relPath },
      {
        $setOnInsert: {
          filename,
          originalName,
          path: relPath,
          mimeType,
          size: buf.length,
          width,
          height,
          alt: altFromName(originalName),
          uploadedBy: "seed",
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    map.set(originalName, doc!._id as mongoose.Types.ObjectId);
  }
  console.log(`✓ media ready: ${map.size} file(s) under ${destDir}`);
  return map;
}

/** Upsert a Media doc for a file that already ships under `public/`. */
async function seedMediaFromPublic(
  path: string,
  alt: string,
): Promise<mongoose.Types.ObjectId> {
  const filename = basename(path);
  const doc = await Media.findOneAndUpdate(
    { path },
    {
      $setOnInsert: {
        filename,
        originalName: filename,
        path,
        mimeType: "image/svg+xml",
        size: 0,
        alt,
        uploadedBy: "seed",
      },
    },
    { upsert: true, returnDocument: "after" },
  );
  return doc!._id as mongoose.Types.ObjectId;
}

async function main() {
  await connectDb();

  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Site Admin";

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env");
  }

  // Media library from `input_media/` (idempotent upsert on every run).
  const media = await seedMedia();
  const mediaId = (name: string) => {
    const _id = media.get(name);
    if (!_id)
      throw new Error(
        `seed: expected media file "${name}" in input_media/ or input_pages/`,
      );
    return _id;
  };

  // `SEED_RESET=1 npm run seed` re-seeds site settings, menus and page stubs
  // from scratch (useful after a rebrand). Users, posts and case studies are
  // never deleted; the sample case study below is insert-if-missing only.
  if (process.env.SEED_RESET === "1") {
    await Setting.deleteMany({});
    await Menu.deleteMany({});
    await Page.deleteMany({ slug: { $in: ["home", "services", "products", "about", "approach", "contact"] } });
    console.log("↺ reset settings, menus and default page stubs");
  }

  // Master user (idempotent: create if missing, otherwise leave untouched).
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`✓ master user already exists: ${email}`);
  } else {
    await User.create({
      email,
      name,
      passwordHash: await hashPassword(password),
      role: "master",
      active: true,
    });
    console.log(`✓ created master user: ${email}`);
  }

  // Site settings singleton (Advait Solutions defaults).
  const brand = siteContent.brand;
  const setting = await Setting.findOneAndUpdate(
    { key: "site" },
    {
      $setOnInsert: {
        key: "site",
        siteName: brand.name,
        siteUrl: process.env.SITE_URL ?? "https://www.advaitsolutions.com",
        tagline: brand.tagline,
        defaultSeoTitle: `${brand.name} — ${brand.tagline}`,
        defaultSeoDescription: brand.description,
        contactEmail: brand.contactEmail,
        contactPhone: "+91 9426824374",
        address:
          "128 – Soham Arcade,\nBehind Madhav Atria,\nNear Gauravpath Road, Baghban Circle,\nSurat – 395009\nGujarat, India",
        clients:
          "Remote-first · Serving US, Canada, UK, Europe & the Middle East",
        editor: "blocknote",
        social: { linkedin: brand.linkedin },
      },
    },
    { upsert: true, returnDocument: "after" },
  );
  console.log(`✓ settings ready: ${setting.siteName}`);

  // Header + footer menus.
  const header = siteContent.nav.map((n, i) => ({
    label: n.label,
    type: "custom",
    url: n.href,
    order: i,
  }));
  const footer = siteContent.footerNav.map((n, i) => ({
    label: n.label,
    type: "custom",
    url: n.href,
    order: i,
  }));

  for (const [menuName, location, items] of [
    ["Main", "header", header],
    ["Footer", "footer", footer],
  ] as const) {
    const menu = await Menu.findOneAndUpdate(
      { location },
      { $setOnInsert: { name: menuName, location, items, isActive: true } },
      { upsert: true, returnDocument: "after" },
    );
    console.log(`✓ menu ready: ${menu.name} (${menu.location})`);
  }

  // Published Page stubs so nav links resolve and admins can edit SEO / intro.
  // Structured content in app/lib/site-content.ts carries the visual design;
  // the CMS body is an optional add-on.
  const pageStubs: {
    title: string;
    slug: string;
    template: string;
    seo: string;
    coverImage?: mongoose.Types.ObjectId;
  }[] = [
    { title: "Home", slug: "home", template: "home", seo: siteContent.home.hero.subhead },
    {
      title: "Services",
      slug: "services",
      template: "default",
      seo: siteContent.pages.services.hero.lead,
      coverImage: mediaId("cover_image_services.png"),
    },
    { title: "AI Products", slug: "products", template: "default", seo: siteContent.pages.products.hero.lead },
    { title: "About", slug: "about", template: "about", seo: siteContent.pages.about.hero.lead },
    { title: "Approach", slug: "approach", template: "default", seo: siteContent.pages.approach.hero.lead },
    { title: "Contact", slug: "contact", template: "contact", seo: "Start a project with a senior software and AI partner." },
  ];
  for (const p of pageStubs) {
    const page = await Page.findOneAndUpdate(
      { slug: p.slug },
      {
        $setOnInsert: {
          title: p.title,
          slug: p.slug,
          template: p.template,
          status: "published",
          seoDescription: p.seo,
          body: [],
          coverImage: p.coverImage,
          publishedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    console.log(`✓ page ready: ${page.title} (/${page.slug})`);

    // `SEED_RELINK_MEDIA=1 npm run seed` also refreshes a page stub's seed-managed
    // cover image on an existing record (the $setOnInsert above only applies on
    // first insert).
    if (p.coverImage && process.env.SEED_RELINK_MEDIA === "1") {
      await Page.updateOne({ slug: p.slug }, { $set: { coverImage: p.coverImage } });
    }
  }

  // Sample structured case study (insert-if-missing; never overwrites edits,
  // unless SEED_RELINK_MEDIA=1 — see below).
  const csSlug = "hydrotherapy-control-system";
  const csCoverImage = mediaId(
    "banner_image_case_study_Twenty_Years_of_Systems_Discipline.png",
  );
  const csSections = caseStudySections(mediaId);
  const caseStudy = await CaseStudy.findOneAndUpdate(
    { slug: csSlug },
    {
      $setOnInsert: {
        title:
          "Twenty Years of Systems Discipline. Thirty Days to Production.",
        slug: csSlug,
        status: "published",
        publishedAt: new Date(),
        body: [],
        coverImage: csCoverImage,
        featured: true,
        order: 1,
        client: "Hydrotherapy device manufacturer",
        industry: "Medical devices / Rehabilitation",
        services: [
          "Firmware integration",
          "Native Android",
          "Cloud sync",
          "AI-accelerated delivery",
        ],
        year: 2025,
        heroEyebrow: "Case Study — Hydrotherapy Control System",
        excerpt:
          "We paired two decades of experience building software that isn't allowed to fail with AI-accelerated engineering to take a hydrotherapy device from concept to a production-grade Android platform — native hardware control, cloud sync, and a full clinic workflow included — in under a month.",
        seoDescription:
          "How senior systems judgment plus AI-accelerated engineering took a hydrotherapy control system from concept to a production-grade native Android platform in under 30 days.",
        readouts: [
          { label: "Systems engineering", value: "20+ yrs" },
          { label: "Concept → production", value: "<30 days" },
          { label: "Stack", value: "ESP32 + native Android" },
          { label: "Build", value: "AI-accelerated" },
        ],
        sections: csSections,
      },
    },
    { upsert: true, returnDocument: "after" },
  );
  console.log(`✓ case study ready: /works/${caseStudy.slug}`);

  // Second case study — WooCommerce → Shopify migration.
  const cs2Slug = "woocommerce-to-shopify-migration";
  const cs2CoverImage = mediaId("cover_image_case_study_2_woo_to_shopify.png");
  const cs2Sections = caseStudy2Sections();
  await CaseStudy.findOneAndUpdate(
    { slug: cs2Slug },
    {
      $setOnInsert: {
        title:
          "A Custom WooCommerce Store, Re-platformed to Shopify — Without Losing the Hard Parts",
        slug: cs2Slug,
        status: "published",
        publishedAt: new Date(),
        body: [],
        coverImage: cs2CoverImage,
        featured: false,
        order: 2,
        client: "Direct-to-consumer eCommerce retailer",
        industry: "Retail / eCommerce",
        services: [
          "Shopify migration",
          "Custom Shopify app",
          "Carrier rate integration",
          "Performance engineering",
        ],
        year: 2024,
        heroEyebrow: "Case Study — WooCommerce → Shopify Migration",
        excerpt:
          "A fully custom, self-hosted WooCommerce store moved onto Shopify — including a multi-carrier shipping engine, hazmat classification and all, rebuilt as a store-exclusive app fast enough to beat Shopify's checkout timeout.",
        seoDescription:
          "How we re-platformed a code-controlled WooCommerce store to Shopify and rebuilt its multi-carrier shipping-rate plugin as a parallelised, store-exclusive Shopify app on Google Cloud.",
        readouts: [
          { label: "Platform", value: "Woo → Shopify" },
          { label: "Shipping app", value: "Store-exclusive" },
          { label: "Carrier calls", value: "Parallel cURL" },
          { label: "Host", value: "Google Cloud" },
        ],
        sections: cs2Sections,
      },
    },
    { upsert: true },
  );
  console.log(`✓ case study ready: /works/${cs2Slug}`);

  // Third case study — lead-gen landing page → multi-tenant SaaS platform.
  const cs3Slug = "real-estate-saas-platform";
  const cs3CoverImage = mediaId(
    "cover_image_case_study_3_landing_page_to_saas.png",
  );
  const cs3Sections = caseStudy3Sections();
  await CaseStudy.findOneAndUpdate(
    { slug: cs3Slug },
    {
      $setOnInsert: {
        title:
          "From a One-Page Lead Form to a Multi-Tenant SaaS Powering Hundreds of Real Estate Sites",
        slug: cs3Slug,
        status: "published",
        publishedAt: new Date(),
        body: [],
        coverImage: cs3CoverImage,
        featured: false,
        order: 3,
        client: "Real estate technology company (US & Canada)",
        industry: "PropTech / Real estate software",
        services: [
          "SaaS productization",
          "Multi-tenant architecture",
          "Server infrastructure & scaling",
          "Front-end product design",
        ],
        year: 2023,
        heroEyebrow: "Case Study — Real Estate SaaS Platform",
        excerpt:
          "A single lead-capture landing page grew into a multi-tenant platform that provisions a fully hosted MLS website — domain, SSL and CRM included — in minutes, and scales horizontally across hundreds of tenant sites.",
        seoDescription:
          "How deep server-infrastructure expertise plus front-end product thinking turned per-client real estate landing pages into a horizontally-scalable multi-tenant SaaS with minutes-to-live site provisioning.",
        readouts: [
          { label: "Model", value: "Landing page → SaaS" },
          { label: "New site live in", value: "Minutes" },
          { label: "Tenancy", value: "Multi-tenant" },
          { label: "Scaling", value: "Horizontal" },
        ],
        sections: cs3Sections,
      },
    },
    { upsert: true },
  );
  console.log(`✓ case study ready: /works/${cs3Slug}`);

  // `SEED_RELINK_MEDIA=1 npm run seed` force-refreshes the seed-managed cover
  // image + section blocks (and their media refs) on an existing record.
  if (process.env.SEED_RELINK_MEDIA === "1") {
    await CaseStudy.updateOne(
      { slug: csSlug },
      { $set: { coverImage: csCoverImage, sections: csSections } },
    );
    await CaseStudy.updateOne(
      { slug: cs2Slug },
      { $set: { coverImage: cs2CoverImage, sections: cs2Sections } },
    );
    await CaseStudy.updateOne(
      { slug: cs3Slug },
      { $set: { coverImage: cs3CoverImage, sections: cs3Sections } },
    );
    console.log("↺ relinked case-study cover image + section media");
  }

  // Company history (placeholder archive of past offices + logos).
  const currentAddressLines =
    "128 – Soham Arcade,\nBehind Madhav Atria,\nNear Gauravpath Road, Baghban Circle,\nSurat – 395009\nGujarat, India";
  const chAddresses = [
    {
      label: "Surat HQ",
      lines: currentAddressLines,
      city: "Surat",
      country: "India",
      type: "main-office",
      status: "open-current",
      fromYear: 2019,
      order: 0,
    },
    {
      label: "Old Surat Office",
      lines: "Placeholder — replace with the real address.",
      city: "Surat",
      country: "India",
      type: "branch",
      status: "permanently-closed",
      fromYear: 2010,
      toYear: 2019,
      note: "Placeholder — replace with the real historical address.",
      order: 1,
    },
    {
      label: "First Office",
      lines: "Placeholder — replace with the real address.",
      city: "Surat",
      country: "India",
      type: "main-office",
      status: "permanently-closed",
      fromYear: 2004,
      toYear: 2010,
      note: "Placeholder — replace with the real historical address.",
      order: 2,
    },
  ];
  const chLogos = [
    {
      image: await seedMediaFromPublic("/brand/logo.svg", "Advait Solutions logo"),
      label: "Current wordmark",
      fromYear: 2020,
      note: "Placeholder — replace with the real historical logo.",
      order: 0,
    },
    {
      image: await seedMediaFromPublic(
        "/brand/logo-mono.svg",
        "Advait Solutions monochrome logo",
      ),
      label: "Monochrome mark",
      fromYear: 2012,
      toYear: 2020,
      note: "Placeholder — replace with the real historical logo.",
      order: 1,
    },
    {
      image: await seedMediaFromPublic(
        "/brand/logo-mark.svg",
        "Advait Solutions logo mark",
      ),
      label: "Original mark",
      fromYear: 2004,
      toYear: 2012,
      note: "Placeholder — replace with the real historical logo.",
      order: 2,
    },
  ];
  await CompanyHistory.findOneAndUpdate(
    { key: "company-history" },
    {
      $setOnInsert: {
        key: "company-history",
        intro:
          "Two decades in, and almost nothing about how we present ourselves has stood still — except the work. These are the offices we've run from and the logos we've worn. (Seeded placeholders — edit under Admin → Company History.)",
        addresses: chAddresses,
        logos: chLogos,
      },
    },
    { upsert: true },
  );
  console.log("✓ company history ready: /history");

  if (process.env.SEED_RELINK_MEDIA === "1") {
    await CompanyHistory.updateOne(
      { key: "company-history" },
      { $set: { addresses: chAddresses, logos: chLogos } },
    );
    console.log("↺ relinked company-history addresses + logo media");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

/** Ordered case-study section blocks, with curated screenshot media wired in. */
function caseStudySections(
  mediaId: (name: string) => mongoose.Types.ObjectId,
) {
  return [
          {
            type: "prose",
            data: {
              body: "A hydrotherapy device isn't a toy. It runs water through a machine wired to a patient, on a timer, watched by a therapist who needs to trust every number on the screen. Our client needed a tablet-based control system for exactly that kind of device — and needed it fast enough to get real clinics running before the opportunity window closed.",
            },
          },
          {
            type: "challenge",
            data: {
              label: "The Challenge",
              title:
                "A Medical-Adjacent Device, a Fragile Foundation, and a Month on the Clock",
              intro:
                "The physical machine — the part patients are actually connected to — is run by an ESP32 microcontroller. Everything else was ours to build: a tablet app for therapists to manage patients, run live sessions, and watch real-time telemetry; a way to control the machine's hardware safely; and a business model wrapped around all of it.",
              items: [
                {
                  title: "A brittle pairing model",
                  body: "The ESP32 ran as its own WiFi Access Point with a fixed SSID and password — the tablet had to find and join it manually, every time, in a busy clinic.",
                },
                {
                  title: "A licensing engine, wired into hardware",
                  body: "A Demo Mode was required: a limited number of trial sessions, after which the device locks until a supplier upgrades it to Full Mode.",
                },
                {
                  title: 'Zero tolerance for "usually works"',
                  body: "A session dropping mid-therapy isn't a bug report — it's a patient standing next to a machine that stopped responding.",
                },
              ],
            },
          },
          {
            type: "journey",
            data: {
              label: "Our Approach & the Technical Journey",
              title: "Three Attempts, One Real Architecture",
              lede: "Good engineering here wasn't about writing more code, faster. It was about recognizing, quickly, when an approach had hit a genuine ceiling — and pivoting before it cost us weeks we didn't have.",
              nodes: [
                {
                  status: "dead-end",
                  title: "PWA + mDNS Discovery",
                  body: "We started where most teams would: a Progressive Web App built in Ionic React, with the ESP32 advertising itself over mDNS so the tablet could find it automatically. It worked cleanly on our own hardware — and broke unpredictably across the mix of Android tablets clinics actually use. mDNS resolution proved too inconsistent to put in front of a therapist mid-session.",
                },
                {
                  status: "dead-end",
                  title: "IP Relay via an In-Browser Server",
                  body: "Plan B was IP-based: have the ESP32 report its address to a small server running inside the PWA itself, reachable at the tablet's own hotspot gateway IP. On paper it closed the discovery gap. In practice it hit a hard platform wall — browsers are sandboxed by design and simply cannot host a listening server. That's a boundary, not a bug, and no amount of clever code gets around it.",
                },
                {
                  status: "breakthrough",
                  title: "The Pivot: Native Android via Capacitor",
                  body: "Recognizing the ceiling early, we moved the client off the web platform entirely, rebuilding it as a native Android app with Capacitor. That single architectural move unlocked what the browser never could: the tablet creates its own WiFi hotspot, the ESP32 joins it in Station Mode, and the two now talk over a connection the app fully owns — live sensor telemetry flowing in, hardware commands flowing out, no router and no discovery protocol left to fail.",
                },
              ],
              architecture: {
                before: {
                  heading: "Before — PWA in browser",
                  from: "Tablet · PWA (browser)",
                  to: "ESP32 · AP mode",
                  via: "mDNS / in-browser relay",
                  blocked: "blocked by browser sandbox",
                },
                after: {
                  heading: "After — Native Android (Capacitor)",
                  from: "Tablet · Native app · hosts Wi-Fi hotspot",
                  to: "ESP32 · Station mode",
                  flows: ["sensor telemetry", "hardware commands"],
                },
                caption:
                  "Two dead ends the client tried to reach the machine from inside a browser, both stopped by real platform boundaries — and the native rebuild that finally gave the app a connection it fully owns, in both directions.",
              },
            },
          },
          {
            type: "prose",
            data: {
              body: "This is where twenty-plus years of building systems that have to just work pays for itself — knowing which failure is a symptom worth debugging, and which one is a wall worth walking around. AI-accelerated development gave us the raw velocity to rebuild the client natively, wire up the hotspot-to-station handshake, and re-implement every screen in days rather than weeks. But the judgment to spend that velocity on the right rebuild, at the right moment, is what kept a one-month timeline realistic instead of reckless.",
            },
          },
          {
            type: "solution",
            data: {
              label: "The Solution",
              title: "One Connected System, Not a Pile of Screens",
              lede: "The finished architecture keeps the hardware deliberately dumb and puts every ounce of intelligence — and every business rule — in the app.",
              cards: [
                {
                  title: "ESP32 — Thin by Design",
                  tags: ["Firmware"],
                  body: "Station-mode WiFi client only. Reads temperature, water level, and pressure; drives the heater, pump, flush, and blower. No business logic on the device — nothing to update in the field.",
                },
                {
                  title: "Android App — The Brain",
                  tags: ["App"],
                  body: "Hosts the hotspot, runs the live control loop, and manages therapists, patients, and the full session lifecycle — Prepare, Start, Pause / Resume, Flush, End.",
                },
                {
                  title: "Offline-First by Default",
                  tags: ["Resilience"],
                  body: "Local storage backs every session with cloud sync layered on top, so a dropped connection mid-therapy pauses gracefully instead of failing outright.",
                },
                {
                  title: "Demo — Full Licensing, Built In",
                  tags: ["Business logic"],
                  body: "Session counting, an app-lock screen with the supplier's own contact details, and a Supplier panel that can extend a demo or activate Full Mode remotely — a technical constraint turned into a working sales tool.",
                },
              ],
            },
          },
          {
            type: "evolution",
            data: {
              label: "Design Evolution",
              title: 'From "Show Everything" to "Show What\'s Needed"',
              lede: "The early concepts followed the brief closely — a classic engineer's-eye dashboard, every metric and every gauge on screen at once. Good instinct for coverage; wrong instinct for a therapist standing at a tablet mid-session.",
              rows: [
                {
                  before: mediaId("Dashboard-Hydro-Colon-Therapy.png"),
                  after: mediaId("dashboard.png"),
                  beforeLabel: "Initial concept",
                  afterLabel: "Production",
                  caption:
                    "The prototype put six live readouts, a tank graphic, and a full sidebar in front of the operator before they'd even started a session. Production distills that same coverage into four unambiguous destinations — Therapy, Therapy Logs, Settings, Resources — with the machine's serial number and connection state fixed in the header, always visible, never buried in a sidebar.",
                },
                {
                  before: mediaId("Control-Panel-Hydro-Colon-Therapy.png"),
                  after: mediaId("therapy_connected.png"),
                  beforeLabel: "Initial concept",
                  afterLabel: "Production",
                  caption:
                    "Threshold configuration moved out of a standalone Control Panel and into the moment it's actually needed. The therapy flow itself replaced raw sensor jargon with the plain three-step language therapists and patients actually use — Hydrate, Soften, Evacuate — with machine connection state confirmed before a session can even begin.",
                },
                {
                  before: mediaId("User-Management-Hydro-Colon-Therapy.png"),
                  after: mediaId("manage_therapists.png"),
                  beforeLabel: "Initial concept",
                  afterLabel: "Production",
                  caption:
                    "Early role-and-permissions thinking became a straightforward, searchable Manage Therapists / Manage Patients list — the access-control problem solved once, structurally, in the backend, rather than surfaced as another screen for the operator to configure.",
                },
              ],
              showcase: [
                {
                  image: mediaId("app_lock.png"),
                  label: "New in Production",
                  body: "Demo Mode wasn't in the original screen list — it's the licensing engine described above, given a face: a lock screen that tells the therapist exactly why the device stopped, and exactly who to call.",
                },
                {
                  image: mediaId("supplier_extend_demo.png"),
                  label: "New in Production",
                  body: "And on the other end of that phone call: a Supplier panel where extending a demo or activating a machine is two clicks, not a support ticket.",
                },
              ],
            },
          },
          {
            type: "results",
            data: {
              label: "Key Results & Impact",
              title: "What Shipped, in Under a Month",
              tiles: [
                {
                  value: "<30",
                  label: "Days, concept to production-grade build",
                  detail: "Firmware through supplier panel",
                },
                {
                  value: "0",
                  label: "Web-platform dead ends left in production",
                  detail: "Rebuilt native, not patched around",
                },
                {
                  value: "3",
                  label: "Connected tiers shipped as one system",
                  detail: "Owner app, supplier panel, admin console",
                },
                {
                  value: "100%",
                  label: "Session-safe",
                  detail:
                    "Therapy pauses and resumes through connectivity drops",
                },
              ],
            },
          },
          {
            type: "conclusion",
            data: {
              label: "Why This Matters",
              title: "Judgment, Applied at AI Speed",
              lede: 'Most "AI-accelerated" delivery stories are about typing faster. This one is about a team that has spent twenty-plus years learning exactly where systems break — connectivity, hardware boundaries, real clinic conditions — and now has the tooling to build around that judgment at a speed that used to be impossible.',
              body: "That combination is what let a medical-adjacent device go from a whiteboard sketch to a machine running real therapy sessions in under a month, without cutting the corners a device like this can't afford to cut.",
              signoff:
                "Hardware Integration · Native Android · Cloud Sync · AI-Accelerated Delivery",
            },
          },
  ];
}

/** Ordered section blocks for the WooCommerce → Shopify migration case study. */
function caseStudy2Sections() {
  return [
    {
      type: "prose",
      data: {
        body: "The client had spent years building their store the way serious eCommerce teams used to: WordPress and WooCommerce, self-hosted, every line of code theirs to change. That freedom was also the problem. The business now ran on custom logic — multi-carrier shipping math, hazardous-goods rules, three tiers of customer pricing — and they wanted the operational calm of Shopify without throwing any of it away.",
      },
    },
    {
      type: "challenge",
      data: {
        label: "The Challenge",
        title: "A SaaS Platform That Doesn't Let You Touch the Parts That Matter",
        intro:
          "Shopify takes a lot of hard problems off your plate. It also takes away the keys. Moving a store that depended on deep custom code meant re-solving each piece inside a platform that owns the checkout, meters your code access, and enforces its own performance rules.",
        items: [
          {
            title: "Code access shrinks to a theme",
            body: "WooCommerce gave the client full server and code control. On Shopify you get the theme, App Store apps, and tightly scoped custom apps — everything else runs through APIs, on Shopify's terms.",
          },
          {
            title: "The checkout isn't yours",
            body: "Cart and checkout flow are controlled by Shopify. Any custom behaviour — pricing, shipping, validation — has to hook in through a supported API rather than a plugin dropped into the codebase.",
          },
          {
            title: "A shipping engine, not a shipping setting",
            body: "The original store priced every order against multiple third-party carriers — eShipper, KH Ship, UPS, USPS and more — with hazardous-product classification and per-shipment cost adjustments layered on top. None of that maps to Shopify's built-in rates.",
          },
          {
            title: "A timeout that fails the sale",
            body: "Shopify calls the shipping-rate endpoint with a strict timeout. If the response is slow, the shopper sees “Shipping not available” and the order dies. A faithful port of the old plugin would have been correct and useless.",
          },
          {
            title: "Pricing that changes per customer",
            body: "Normal customers, Artists and Wholesalers each see different prices, with quantity-based tiers on top — and the tiers had to render as a clean, readable table, not a wall of variants.",
          },
        ],
      },
    },
    {
      type: "journey",
      data: {
        label: "Our Approach & the Technical Journey",
        title: "The Fix Was Concurrency, Not a Bigger Server",
        lede: "The shipping problem looked like a hosting problem. It wasn't. The old plugin asked each carrier for a rate one after another; on Shopify's clock, the sum of those round trips was the whole budget. Speeding up any single call barely moved the number.",
        nodes: [
          {
            status: "milestone",
            title: "Map the plugin before touching it",
            body: "We reverse-engineered the WooCommerce shipping plugin end to end — every carrier integration, the hazmat classification rules, the cost adjustments — so the Shopify rebuild matched the real behaviour, not a summary of it.",
          },
          {
            status: "dead-end",
            title: "A straight port on shared hosting",
            body: "Re-implementing the same sequential carrier calls behind a Shopify rate endpoint reproduced the exact failure we were hired to remove: on a busy cart, the combined carrier latency blew past Shopify's timeout and checkout showed “Shipping not available.”",
          },
          {
            status: "breakthrough",
            title: "One store-exclusive app, calls fired in parallel",
            body: "We rebuilt the engine as a custom Shopify app exclusive to the client's store, hosted on Google Cloud, and rewrote the rate logic to call every carrier concurrently with PHP cURL multi-handles. Total response time collapsed to roughly the slowest single carrier — comfortably inside Shopify's window.",
          },
        ],
        architecture: {
          before: {
            heading: "Before — sequential rate calls",
            from: "Shopify checkout",
            to: "Carrier APIs, one after another",
            via: "ported plugin on shared hosting",
            blocked: "sum of carrier latency exceeds Shopify's rate-endpoint timeout",
          },
          after: {
            heading: "After — parallel rate app on GCP",
            from: "Shopify checkout",
            to: "Store-exclusive app · Google Cloud",
            flows: [
              "parallel cURL multi to every carrier",
              "hazmat rules + cost adjustments applied",
              "merged rates returned within the timeout",
            ],
          },
          caption:
            "Moving to a faster host helped at the margins; running the carrier calls concurrently instead of serially is what actually put the response back inside Shopify's budget.",
        },
      },
    },
    {
      type: "solution",
      data: {
        label: "The Solution",
        title: "The Custom Logic Survives — Shopify Just Doesn't Know It's There",
        lede: "The shopper sees a normal Shopify checkout. Behind it, a purpose-built app does the same work the old WooCommerce plugin did, faster and with less to maintain.",
        cards: [
          {
            title: "A store-exclusive Shopify app",
            tags: ["Architecture"],
            body: "Not a public App Store listing — a private app scoped to this one store, so the client keeps the custom behaviour they need without giving up Shopify's managed platform.",
          },
          {
            title: "Tuned Google Cloud hosting",
            tags: ["Infrastructure"],
            body: "The app runs on a fast Google Cloud server configured for Shopify's traffic patterns, keeping the rate endpoint responsive under real checkout load.",
          },
          {
            title: "Parallel carrier rating",
            tags: ["Performance"],
            body: "Every third-party carrier call — eShipper, KH Ship, UPS, USPS and the rest — fires at once via cURL multi-handles, with hazardous-goods classification and shipment cost adjustments applied to the merged result.",
          },
          {
            title: "Role-based & tiered pricing",
            tags: ["Storefront"],
            body: "Normal, Artist and Wholesaler pricing plus quantity breaks, resolved through Shopify's APIs and presented as a clean tiered-pricing table on the product page.",
          },
        ],
      },
    },
    {
      type: "results",
      data: {
        label: "Key Results & Impact",
        title: "What the Migration Delivered",
        lede: "",
        tiles: [
          {
            value: "0",
            label: "Checkout-killing rate timeouts",
            detail: "Every quote returns inside Shopify's window",
          },
          {
            value: "1",
            label: "Store-exclusive Shopify app",
            detail: "Full custom logic without leaving SaaS",
          },
          {
            value: "4+",
            label: "Carriers priced in parallel",
            detail: "eShipper, KH Ship, UPS, USPS…",
          },
          {
            value: "3",
            label: "Pricing tiers preserved",
            detail: "Normal, Artist, Wholesaler + quantity breaks",
          },
        ],
      },
    },
    {
      type: "conclusion",
      data: {
        label: "Why This Matters",
        title: "SaaS Limits Are Design Problems, Not Dead Ends",
        lede: "Re-platforming to Shopify is easy to sell and hard to do well when a store runs on custom code. The trap is treating the platform's constraints as walls instead of as a brief.",
        body: "We kept the client on managed infrastructure, kept their shipping and pricing logic intact, and made the checkout faster than it was on the store they controlled outright — because the real work was picking the right fix (concurrency) over the obvious one (a bigger box).",
        signoff:
          "Shopify Migration · Custom Shopify App · Carrier Rate Integration · Performance Engineering",
      },
    },
  ];
}

/** Ordered section blocks for the real-estate SaaS platform case study. */
function caseStudy3Sections() {
  return [
    {
      type: "prose",
      data: {
        body: "We were hired to build one thing: a lead-capture landing page for a company selling software to real estate agents across the US and Canada. That page did its job. Then the next agent needed the same thing for a different territory. Then the next. Every agent, every service area, wanted a full MLS website — property search, live listings, an admin panel where their area's leads landed — and each one was a separate build.",
      },
    },
    {
      type: "challenge",
      data: {
        label: "The Challenge",
        title: "A New Bespoke Site for Every Agent Doesn't Scale",
        intro:
          "After shipping several buyer and seller sites, the pattern was obvious — and so was the problem. The same features and the same structure were being rebuilt by hand for every agent, each on its own server footprint.",
        items: [
          {
            title: "One site per agent, per area",
            body: "Every real estate agent and every service territory required its own separate website, its own admin panel, and its own deployment.",
          },
          {
            title: "MLS features aren't trivial",
            body: "Property search, continuously updated listings, and area-scoped lead routing to the right agent's inbox is real product surface — and it was being repeated for every tenant.",
          },
          {
            title: "Growth broke the server, not the product",
            body: "As the number of sites climbed into the hundreds, disk space, cron-job load and single-server limits turned into hard bottlenecks.",
          },
          {
            title: "Non-technical users, technical system",
            body: "Agents needed to change their own site's look and content on their own — without filing a support ticket or waiting on a developer.",
          },
        ],
      },
    },
    {
      type: "journey",
      data: {
        label: "Our Approach & the Technical Journey",
        title: "Productize the Pattern, Then Make the Platform Scale",
        lede: "We stopped treating each site as a project and started treating the whole collection as one product. That reframing drove two builds at once: a front-end system that provisions sites in a few clicks, and a back-end one that survives hundreds of tenants on shared infrastructure.",
        nodes: [
          {
            status: "milestone",
            title: "Spot the common structure",
            body: "Across the buyer and seller sites we'd already delivered, the feature set and information architecture were nearly identical. That was the signal to productize.",
          },
          {
            status: "milestone",
            title: "A master admin that ships sites",
            body: "We built a control panel where the client adds a domain, picks Buyer or Seller, enters the agent's information, and draws the service area on a Google Maps interface. Custom PHP scripts and server APIs then provision the entire site — domain mapping and SSL certificate included — and it's live within minutes.",
          },
          {
            status: "dead-end",
            title: "One big server, hundreds of full copies",
            body: "Every tenant carried its own complete copy of the CakePHP framework and its own cron jobs. Disk filled up, the cron queue serialized, and a single application server couldn't keep pace with the fleet.",
          },
          {
            status: "breakthrough",
            title: "Share what's identical, parallelise what isn't",
            body: "Symbolic links collapsed hundreds of duplicated framework trees into one shared copy, reclaiming disk across every site. Cron scripts for notification emails and site-specific tasks were refined and set to run in parallel across sites. And the application was re-architected to run across multiple application servers — true horizontal scaling.",
          },
        ],
        architecture: {
          before: {
            heading: "Before — one server, N full copies",
            from: "Each tenant site",
            to: "Own framework copy + serial cron jobs",
            via: "a single application server",
            blocked: "disk, cron backlog and CPU cap out as sites multiply",
          },
          after: {
            heading: "After — multi-tenant, horizontally scaled",
            from: "Master admin provisions a tenant",
            to: "Shared framework via symlinks · parallel crons",
            flows: [
              "domain + SSL automated in minutes",
              "load spread across multiple app servers",
              "cost per site falls as the fleet grows",
            ],
          },
          caption:
            "The product didn't change — the way it's hosted did. Sharing what's identical between tenants and parallelising what isn't turned a fleet that fought the server into one the server barely notices.",
        },
      },
    },
    {
      type: "solution",
      data: {
        label: "The Solution",
        title: "A Platform Agents Run Themselves",
        lede: "The same system that provisions a site also hands the agent the keys — no developer in the loop for day-to-day changes.",
        cards: [
          {
            title: "Minutes-to-live provisioning",
            tags: ["Automation"],
            body: "Add a domain, choose the site type, enter the agent's details, and pick the service area on Google Maps. PHP scripts and server APIs handle domain mapping, SSL and deployment automatically.",
          },
          {
            title: "Themes + inline visual editor",
            tags: ["Front-end"],
            body: "Multiple selectable themes and an in-page visual customization editor let agents restyle and edit their own sites with no technical help.",
          },
          {
            title: "From CMS to real-estate CRM",
            tags: ["Product"],
            body: "The simple lead inbox grew into a full-featured CRM tailored to how real estate agents actually work leads, listings and clients.",
          },
          {
            title: "Infrastructure built to divide",
            tags: ["Backend"],
            body: "Shared framework files, parallel site-scoped cron jobs, and a multi-application-server architecture keep reliability high and per-site cost low as the fleet grows.",
          },
        ],
      },
    },
    {
      type: "results",
      data: {
        label: "Key Results & Impact",
        title: "A Fleet That Gets Cheaper to Run as It Grows",
        lede: "",
        tiles: [
          {
            value: "Minutes",
            label: "From “add domain” to live site",
            detail: "Domain, SSL and deployment fully automated",
          },
          {
            value: "1",
            label: "Shared framework copy, not hundreds",
            detail: "Symlinks reclaim disk across the whole fleet",
          },
          {
            value: "N+",
            label: "Application servers, horizontally scaled",
            detail: "Add nodes to add capacity",
          },
          {
            value: "↓",
            label: "Infrastructure cost per site",
            detail: "Falls as the platform scales up",
          },
        ],
      },
    },
    {
      type: "conclusion",
      data: {
        label: "Why This Matters",
        title: "Scaling Is a Backend Problem With a Front-End Answer",
        lede: "Plenty of teams can build the tenth real estate site. Fewer can turn the first ten into a product — and fewer still can keep that product cheap and reliable at the hundredth tenant.",
        body: "This platform works because two kinds of expertise met in one team: front-end product design that made site creation a self-serve, few-click flow, and server-infrastructure depth that re-architected the hosting so growth lowers cost instead of raising risk. If you're staring at the same scaling or productization wall, that's the conversation we're built for.",
        signoff:
          "SaaS Productization · Multi-Tenant Architecture · Server Infrastructure · Front-End Product Design",
      },
    },
  ];
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
