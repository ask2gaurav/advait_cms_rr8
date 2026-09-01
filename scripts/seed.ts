import mongoose from "mongoose";
import { connectDb } from "../app/lib/db.server";
import { User, hashPassword } from "../app/lib/models/user.server";
import { Setting } from "../app/lib/models/setting.server";
import { Menu } from "../app/lib/models/menu.server";
import { Page } from "../app/lib/models/page.server";
import { CaseStudy } from "../app/lib/models/case-study.server";
import { siteContent } from "../app/lib/site-content";

async function main() {
  await connectDb();

  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Site Admin";

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env");
  }

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
        contactPhone: "+1 (000) 000-0000",
        address: "Remote-first · Serving US, Canada, UK, Europe & the Middle East",
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
  const pageStubs: { title: string; slug: string; template: string; seo: string }[] = [
    { title: "Home", slug: "home", template: "home", seo: siteContent.home.hero.subhead },
    { title: "Services", slug: "services", template: "default", seo: siteContent.pages.services.hero.lead },
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
          publishedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    console.log(`✓ page ready: ${page.title} (/${page.slug})`);
  }

  // Sample structured case study (insert-if-missing; never overwrites edits).
  const csSlug = "hydrotherapy-control-system";
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
        sections: [
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
                  beforeLabel: "Initial concept",
                  afterLabel: "Production",
                  caption:
                    "The prototype put six live readouts, a tank graphic, and a full sidebar in front of the operator before they'd even started a session. Production distills that same coverage into four unambiguous destinations — Therapy, Therapy Logs, Settings, Resources — with the machine's serial number and connection state fixed in the header, always visible, never buried in a sidebar.",
                },
                {
                  beforeLabel: "Initial concept",
                  afterLabel: "Production",
                  caption:
                    "Threshold configuration moved out of a standalone Control Panel and into the moment it's actually needed. The therapy flow itself replaced raw sensor jargon with the plain three-step language therapists and patients actually use — Hydrate, Soften, Evacuate — with machine connection state confirmed before a session can even begin.",
                },
                {
                  beforeLabel: "Initial concept",
                  afterLabel: "Production",
                  caption:
                    "Early role-and-permissions thinking became a straightforward, searchable Manage Therapists / Manage Patients list — the access-control problem solved once, structurally, in the backend, rather than surfaced as another screen for the operator to configure.",
                },
              ],
              showcase: [
                {
                  label: "New in Production",
                  body: "Demo Mode wasn't in the original screen list — it's the licensing engine described above, given a face: a lock screen that tells the therapist exactly why the device stopped, and exactly who to call.",
                },
                {
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
        ],
      },
    },
    { upsert: true, returnDocument: "after" },
  );
  console.log(`✓ case study ready: /works/${caseStudy.slug}`);

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
