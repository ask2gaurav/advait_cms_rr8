import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { Menu as MenuIcon } from "lucide-react";
import type { MenuPublic, SettingsPublic } from "~/lib/types";
import { siteContent } from "~/lib/site-content";
import { cn } from "~/lib/utils";
import { CTALink } from "~/components/ui/CTALink";
import { ThemeToggle } from "~/components/theme-toggle";
import { MobileNav, type NavItem } from "~/components/MobileNav";
import { GridMotif } from "~/components/visuals/GridMotif";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

/** Menu items come from the CMS if present, else the structured default. */
function navItems(menu?: MenuPublic): NavItem[] {
  if (menu && menu.items.length > 0) {
    return menu.items.map((i) => ({
      label: i.label,
      href: i.url,
      external: isExternal(i.url) || i.target === "_blank",
    }));
  }
  return siteContent.nav.map((i) => ({ label: i.label, href: i.href }));
}

function Logo({ settings }: { settings: SettingsPublic }) {
  const src = settings.logo?.path ?? "/brand/logo.svg";
  return (
    <Link to="/" className="flex items-center gap-2" aria-label={settings.siteName}>
      <img
        src={src}
        alt={settings.siteName}
        width={settings.logo?.width ?? 160}
        height={settings.logo?.height ?? 32}
        className="h-8 w-auto"
      />
    </Link>
  );
}

export function SiteHeader({
  settings,
  menu,
}: {
  settings: SettingsPublic;
  menu?: MenuPublic;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navItems(menu);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-cms-section="header"
      className={cn(
        "sticky top-0 z-40 border-b bg-white/90 backdrop-blur transition-shadow dark:bg-gray-950/90",
        scrolled
          ? "border-gray-200 shadow-sm dark:border-gray-800"
          : "border-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Logo settings={settings} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {items.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                  )
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <CTALink
            href="/contact"
            variant="brand"
            size="default"
            className="hidden sm:inline-flex"
          >
            Start a Project
          </CTALink>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <MenuIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </Container>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} items={items} />
    </header>
  );
}

export function SiteFooter({
  settings,
  menu,
}: {
  settings: SettingsPublic;
  menu?: MenuPublic;
}) {
  const links =
    menu && menu.items.length > 0
      ? menu.items.map((i) => ({ label: i.label, href: i.url }))
      : siteContent.footerNav;
  const social = Object.entries(settings.social ?? {}).filter(([, v]) => v);
  const description =
    settings.defaultSeoDescription || siteContent.brand.description;

  return (
    <footer
      data-cms-section="footer"
      className="mt-auto border-t border-gray-200 bg-mist dark:border-gray-800 dark:bg-gray-900/40"
    >
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-2">
          <Logo settings={settings} />
          <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Explore
          </h2>
          <ul className="mt-3 space-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Contact
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {settings.contactEmail && (
              <li>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:text-gray-900 dark:hover:text-white"
                >
                  {settings.contactEmail}
                </a>
              </li>
            )}
            {settings.contactPhone && <li>{settings.contactPhone}</li>}
            {settings.address && (
              <li className="whitespace-pre-line">{settings.address}</li>
            )}
            {social.map(([k, v]) => (
              <li key={k}>
                <a
                  href={v}
                  target="_blank"
                  rel="noreferrer"
                  className="capitalize hover:text-gray-900 dark:hover:text-white"
                >
                  {k}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-gray-200 py-6 dark:border-gray-800">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-gray-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.siteName}
          </p>
          <p>Built for the AI era</p>
        </Container>
      </div>
    </footer>
  );
}

export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-gray-200 bg-mist py-16 sm:py-20 dark:border-gray-800 dark:bg-gray-900/40">
      <GridMotif />
      <Container className="relative">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
          {title}
        </h1>
        {lead && (
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            {lead}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </div>
  );
}
