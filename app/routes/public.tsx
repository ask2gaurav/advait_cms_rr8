import { Outlet } from "react-router";
import type { Route } from "./+types/public";
import { getMenu, getSettings } from "~/lib/content";
import { SiteHeader, SiteFooter } from "~/components/site";

export function loader() {
  return {
    settings: getSettings(),
    headerMenu: getMenu("header"),
    footerMenu: getMenu("footer"),
  };
}

export default function PublicLayout({ loaderData }: Route.ComponentProps) {
  const { settings, headerMenu, footerMenu } = loaderData;
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg dark:focus:bg-gray-900"
      >
        Skip to content
      </a>
      <SiteHeader settings={settings} menu={headerMenu} />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter settings={settings} menu={footerMenu} />
    </div>
  );
}
