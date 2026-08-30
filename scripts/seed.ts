import mongoose from "mongoose";
import { connectDb } from "../app/lib/db.server";
import { User, hashPassword } from "../app/lib/models/user.server";
import { Setting } from "../app/lib/models/setting.server";
import { Menu } from "../app/lib/models/menu.server";
import { Page } from "../app/lib/models/page.server";
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
  // never touched.
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

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
